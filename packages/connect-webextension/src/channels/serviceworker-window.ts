import {
    AbstractMessageChannel,
    AbstractMessageChannelConstructorParams,
    Message,
} from '@trezor/connect-common/src/messageChannel/abstract';

/**
 * Communication channel between:
 * - here: chrome message port (in service worker)
 * - peer: window.onMessage in trezor-content-script
 */
export class ServiceWorkerWindowChannel<
    IncomingMessages extends { type: string },
> extends AbstractMessageChannel<IncomingMessages> {
    private port: chrome.runtime.Port | undefined;

    constructor({
        name,
        channel,
        logger,
        lazyHandshake,
        allowSelfOrigin = false,
    }: Pick<AbstractMessageChannelConstructorParams, 'channel' | 'logger' | 'lazyHandshake'> & {
        name: string;
        allowSelfOrigin?: boolean;
    }) {
        super({
            channel,
            sendFn: (message: any) => {
                if (!this.port) throw new Error('port not assigned');
                this.port.postMessage(message);
            },
            logger,
            lazyHandshake,
        });

        chrome.runtime.onConnect.addListener(port => {
            if (port.name !== name) return;
            this.port = port;

            this.port.onMessage.addListener((message: Message<IncomingMessages>, { sender }) => {
                if (!sender) {
                    this.logger?.error('service-worker-window', 'no sender');
                    return;
                }

                const { origin } = sender;
                const whitelist = [
                    'https://connect.trezor.io',
                    'https://staging-connect.trezor.io',
                    'https://suite.corp.sldev.cz',
                    'http://localhost:8088',
                ];

                // If service worker is running in web extension and other env of this webextension
                // want to communicate with service worker it should be whitelisted.
                const webextensionId = chrome?.runtime?.id;
                if (webextensionId) {
                    whitelist.push(`chrome-extension://${webextensionId}`);
                }

                if (!origin) {
                    this.logger?.error(
                        'connect-webextension/messageChannel/extensionPort/onMessage',
                        'no origin',
                    );

                    return;
                }
                if (!whitelist.includes(origin)) {
                    this.logger?.error(
                        'connect-webextension/messageChannel/extensionPort/onMessage',
                        'origin not whitelisted',
                        origin,
                    );
                    return;
                }

                // TODO: not completely sure that is necessary to prevent self origin communication sometimes.
                // eslint-disable-next-line no-restricted-globals
                if (origin === self.origin && !allowSelfOrigin) {
                    return;
                }

                this.onMessage(message);
            });
        });
    }

    disconnect() {
        this.port?.disconnect();
        this.clear();
    }
}
