import { LightningElement, track, wire } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import LWC_TRAINING_CHANNEL from '@salesforce/messageChannel/LwcTraning__c';

export default class MessageSubscriber extends LightningElement {
    @track receivedMessage = '';
    subscription = null;

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                LWC_TRAINING_CHANNEL,
                (message) => this.handleMessage(message)
            );
        }
    }

    handleMessage(message) {
        this.receivedMessage = `Message: ${message.recordName}, Source: ${message.fieldName}`;
    }
}
