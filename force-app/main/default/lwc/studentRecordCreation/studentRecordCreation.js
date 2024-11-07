import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { publish, MessageContext } from 'lightning/messageService';
import STUDENT_CREATED_CHANNEL from '@salesforce/messageChannel/StudentCreatedChannel__c';

export default class StudentRecordCreation extends LightningElement {
    @track name = '';
    @track dob = '';
    @track sex = '';
    @track languages = '';
    @track country = '';
    @track hobbies = '';

    @wire(MessageContext)
    messageContext;

    handleChange(event) {
        this[event.target.name] = event.target.value;
    }

    handleAddStudent() {
        if (this.name && this.dob && this.sex && this.languages && this.country && this.hobbies) {
            const fields = {
                Name__c: this.name,
                DOB__c: this.dob,
                Sex__c: this.sex,
                Languages__c: this.languages,
                Country__c: this.country,
                Hobbies__c: this.hobbies
            };

            publish(this.messageContext, STUDENT_CREATED_CHANNEL, fields);

            // Reset the input fields
            this.name = '';
            this.dob = '';
            this.sex = '';
            this.languages = '';
            this.country = '';
            this.hobbies = '';

            // Show success toast
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Student created successfully!',
                    variant: 'success',
                })
            );
        }
    }
}
