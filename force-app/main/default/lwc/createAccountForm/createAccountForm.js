import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { publish, MessageContext } from 'lightning/messageService';
import ACCOUNT_CREATED_CHANNEL from '@salesforce/messageChannel/AccountCreatedChannel__c';
import { createRecord } from 'lightning/uiRecordApi';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import NAME_FIELD from '@salesforce/schema/Account.Name';
import INDUSTRY_FIELD from '@salesforce/schema/Account.Industry';
import PHONE_FIELD from '@salesforce/schema/Account.Phone';

export default class CreateAccountForm extends LightningElement {
    @track accountName = '';
    @track accountIndustry = '';
    @track accountPhone = '';
    
    @wire(MessageContext) messageContext;

    handleNameChange(event) {
        this.accountName = event.target.value;
    }

    handleIndustryChange(event) {
        this.accountIndustry = event.target.value;
    }

    handlePhoneChange(event) {
        this.accountPhone = event.target.value;
    }

    handleCreateAccount() {
        const fields = {
            [NAME_FIELD.fieldApiName]: this.accountName,
            [INDUSTRY_FIELD.fieldApiName]: this.accountIndustry,
            [PHONE_FIELD.fieldApiName]: this.accountPhone
        };
        
        createRecord({ apiName: ACCOUNT_OBJECT.objectApiName, fields })
            .then((account) => {
                this.showToast('Success', 'Account created successfully!', 'success');
                
                // Publish message to notify AccountDataTable component
                const payload = {
                    Id: account.id,
                    Name: this.accountName,
                    Industry: this.accountIndustry,
                    Phone: this.accountPhone
                };
                publish(this.messageContext, ACCOUNT_CREATED_CHANNEL, payload);

                // Reset the input fields
                this.template.querySelectorAll('lightning-input-field').forEach(field => field.reset());
                this.accountName = '';
                this.accountIndustry = '';
                this.accountPhone = '';
            })
            .catch((error) => {
                this.showToast('Error', `Error creating account: ${error.body.message}`, 'error');
            });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}
