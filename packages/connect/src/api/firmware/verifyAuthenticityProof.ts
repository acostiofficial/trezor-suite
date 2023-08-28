import * as crypto from 'crypto';
import { bufferUtils } from '@trezor/utils';

import { PROTO } from '../../constants';

/**
 * Module used by `authenticateDevice` method
 *
 * Parse x509 certificate returned from Trezor (PROTO.AuthenticityProof) from DER format.
 * inspired by https://blog.engelke.com/2014/10/21/web-crypto-and-x-509-certificates/
 *
 * Validate certificate and signature...
 */

interface Asn1 {
    cls: number;
    structured: boolean;
    tag: number;
    byteLength: number;
    contents: Uint8Array;
    raw: Uint8Array;
}

const derToAsn1 = (byteArray: Uint8Array): Asn1 => {
    let position = 0;

    function getTag() {
        let tag = byteArray[0] & 0x1f;
        position += 1;
        if (tag === 0x1f) {
            tag = 0;
            while (byteArray[position] >= 0x80) {
                tag = tag * 128 + byteArray[position] - 0x80;
                position += 1;
            }
            tag = tag * 128 + byteArray[position] - 0x80;
            position += 1;
        }
        return tag;
    }

    function getLength() {
        let length = 0;

        if (byteArray[position] < 0x80) {
            length = byteArray[position];
            position += 1;
        } else {
            const numberOfDigits = byteArray[position] & 0x7f;
            position += 1;
            length = 0;
            for (let i = 0; i < numberOfDigits; i++) {
                length = length * 256 + byteArray[position];
                position += 1;
            }
        }
        return length;
    }

    const cls = (byteArray[0] & 0xc0) / 64;
    const structured = (byteArray[0] & 0x20) === 0x20;
    const tag = getTag();

    let length = getLength(); // As encoded, which may be special value 0
    let byteLength;
    let contents;

    if (length === 0x80) {
        length = 0;
        while (byteArray[position + length] !== 0 || byteArray[position + length + 1] !== 0) {
            length += 1;
        }
        byteLength = position + length + 2;
        contents = byteArray.subarray(position, position + length);
    } else {
        byteLength = position + length;
        contents = byteArray.subarray(position, byteLength);
    }

    const raw = byteArray.subarray(0, byteLength); // May not be the whole input array

    return {
        cls,
        structured,
        tag,
        byteLength,
        contents,
        raw,
    };
};

const derToAsn1List = (byteArray: Uint8Array) => {
    const result = [];
    let nextPosition = 0;
    while (nextPosition < byteArray.length) {
        const nextPiece = derToAsn1(byteArray.subarray(nextPosition));
        result.push(nextPiece);
        nextPosition += nextPiece.byteLength;
    }
    return result;
};

const derBitStringValue = (byteArray: Uint8Array) => ({
    unusedBits: byteArray[0],
    bytes: byteArray.subarray(1),
});

const parseSignatureValue = (asn1: Asn1) => {
    if (asn1.cls !== 0 || asn1.tag !== 3 || asn1.structured) {
        throw new Error('Bad signature value. Not a BIT STRING.');
    }
    return {
        asn1,
        bits: derBitStringValue(asn1.contents),
    };
};

const derObjectIdentifierValue = (byteArray: Uint8Array) => {
    let oid = `${Math.floor(byteArray[0] / 40)}.${byteArray[0] % 40}`;
    let position = 1;
    while (position < byteArray.length) {
        let nextInteger = 0;
        while (byteArray[position] >= 0x80) {
            nextInteger = nextInteger * 0x80 + (byteArray[position] & 0x7f);
            position += 1;
        }
        nextInteger = nextInteger * 0x80 + byteArray[position];
        position += 1;
        oid += `.${nextInteger}`;
    }
    return oid;
};

const parseAlgorithmIdentifier = (asn1: Asn1) => {
    if (asn1.cls !== 0 || asn1.tag !== 16 || !asn1.structured) {
        throw new Error('Bad algorithm identifier. Not a SEQUENCE.');
    }
    const pieces = derToAsn1List(asn1.contents);
    if (pieces.length > 2) {
        throw new Error('Bad algorithm identifier. Contains too many child objects.');
    }
    const encodedAlgorithm = pieces[0];
    if (encodedAlgorithm.cls !== 0 || encodedAlgorithm.tag !== 6 || encodedAlgorithm.structured) {
        throw new Error('Bad algorithm identifier. Does not begin with an OBJECT IDENTIFIER.');
    }
    const algorithm = derObjectIdentifierValue(encodedAlgorithm.contents);

    return {
        asn1,
        algorithm,
        parameters: pieces.length === 2 ? { asn1: pieces[1] } : null,
    };
};

const parseSubjectPublicKeyInfo = (asn1: Asn1) => {
    if (asn1.cls !== 0 || asn1.tag !== 16 || !asn1.structured) {
        throw new Error('Bad SPKI. Not a SEQUENCE.');
    }
    const pieces = derToAsn1List(asn1.contents);
    if (pieces.length !== 2) {
        throw new Error('Bad SubjectPublicKeyInfo. Wrong number of child objects.');
    }

    return {
        asn1,
        algorithm: parseAlgorithmIdentifier(pieces[0]),
        bits: derBitStringValue(pieces[1].contents),
    };
};

const parseTBSCertificate = (asn1: Asn1) => {
    if (asn1.cls !== 0 || asn1.tag !== 16 || !asn1.structured) {
        throw new Error("This can't be a TBSCertificate. Wrong data type.");
    }
    const pieces = derToAsn1List(asn1.contents);
    if (pieces.length < 7) {
        throw new Error('Bad TBS Certificate. There are fewer than the seven required children.');
    }

    return {
        asn1,
        version: pieces[0],
        serialNumber: pieces[1],
        signature: parseAlgorithmIdentifier(pieces[2]),
        issuer: pieces[3],
        validity: pieces[4],
        subject: pieces[5],
        subjectPublicKeyInfo: parseSubjectPublicKeyInfo(pieces[6]),
    }; // Ignore optional fields for now
};

const parseCertificate = (byteArray: Uint8Array) => {
    const asn1 = derToAsn1(byteArray);
    if (asn1.cls !== 0 || asn1.tag !== 16 || !asn1.structured) {
        throw new Error("This can't be an X.509 certificate. Wrong data type.");
    }

    const pieces = derToAsn1List(asn1.contents);
    if (pieces.length !== 3) {
        throw new Error('Certificate contains more than the three specified children.');
    }

    return {
        asn1,
        tbsCertificate: parseTBSCertificate(pieces[0]),
        signatureAlgorithm: parseAlgorithmIdentifier(pieces[1]),
        signatureValue: parseSignatureValue(pieces[2]),
    };
};

// There is incomparability in results between window and nodejs SubtleCrypto api.
// window.crypto.subtle.importKey (CryptoKey) cannot be used by `crypto-browserify`.Verify
// the only common format of publicKey is PEM
const verifySignature = async (rawKey: Buffer, data: Uint8Array, signature: Uint8Array) => {
    const signer = crypto.createVerify('sha256');
    signer.update(Buffer.from(data));

    // use native SubtleCrypto api.
    // Unfortunately `crypto-browserify`.subtle polyfill is missing so needs to be referenced from window object (if exists)
    // https://github.com/browserify/crypto-browserify/issues/221
    const subtle = typeof window !== 'undefined' ? window.crypto.subtle : crypto.webcrypto.subtle;

    // get ECDSA P-256 (secp256r1) key from RAW key
    const ecPubKey = await subtle.importKey(
        'raw',
        rawKey,
        { name: 'ECDSA', namedCurve: 'P-256' },
        true,
        ['verify'],
    );

    // export ECDSA key as spki
    const spkiPubKey = await subtle.exportKey('spki', ecPubKey);

    // create PEM from spki
    const key = `-----BEGIN PUBLIC KEY-----\n${Buffer.from(spkiPubKey).toString(
        'base64',
    )}\n-----END PUBLIC KEY-----`;

    // verify using PEM key
    return signer.verify({ key }, Buffer.from(signature));
};

interface AuthenticityProofData extends PROTO.AuthenticityProof {
    challenge: Buffer;
    caPublicKeys: string[];
}

export const getRandomChallenge = () => crypto.randomBytes(32);

export const verifyAuthenticityProof = async ({
    certificate,
    signature,
    challenge,
    caPublicKeys,
}: AuthenticityProofData) => {
    // 1. parse x509 DER certificate from AuthenticityProof
    const cert = parseCertificate(new Uint8Array(Buffer.from(certificate, 'hex')));

    // 2. validate that certificate was created using one of caPubkeys
    const isCertSignedByPubkey = await Promise.all(
        caPublicKeys.map(caPublicKey =>
            verifySignature(
                Buffer.from(caPublicKey, 'hex'),
                cert.tbsCertificate.asn1.raw,
                cert.signatureValue.bits.bytes,
            ),
        ),
    );

    // 3. validate that signature from AuthenticityProof was created using prefixed challenge and certificate pubKey
    const challengePrefix = Buffer.from('AuthenticateDevice:');
    const prefixedChallenge = Buffer.concat([
        bufferUtils.getChunkSize(challengePrefix.length),
        challengePrefix,
        bufferUtils.getChunkSize(challenge.length),
        challenge,
    ]);

    const isSignatureValid = await verifySignature(
        Buffer.from(cert.tbsCertificate.subjectPublicKeyInfo.bits.bytes),
        prefixedChallenge,
        Buffer.from(signature, 'hex'),
    );

    return isCertSignedByPubkey.some(r => !!r) && isSignatureValid;
};
