import { Message } from "../interfaces/message.interface";

const formatMessage = (username: string, text: string): Message => {
  return {
    user: username,
    content: text,
  };
};

export default formatMessage;
