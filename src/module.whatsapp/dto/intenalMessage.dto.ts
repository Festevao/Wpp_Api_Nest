import { Message } from 'whatsapp-web.js';

interface WppMessage extends Message {
  botId: string;
}

export { WppMessage };
