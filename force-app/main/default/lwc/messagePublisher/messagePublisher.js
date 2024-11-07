import { LightningElement, wire } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import LWC_TRAINING_CHANNEL from '@salesforce/messageChannel/LwcTraning__c';

export default class MessagePublisher extends LightningElement {
    @wire(MessageContext)
    messageContext;

    handleClick() {
        const message = {
            recordName: 'Hello, this is a message!',
            fieldName: 'SourceField'
        };
        publish(this.messageContext, LWC_TRAINING_CHANNEL, message);
    }
}
