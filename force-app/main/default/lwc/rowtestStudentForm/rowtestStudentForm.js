import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { publish, MessageContext } from 'lightning/messageService';
import { createRecord } from 'lightning/uiRecordApi';
import STUDENT_CHANNEL from '@salesforce/messageChannel/StudentChannel__c';
import STUDENT_OBJECT from '@salesforce/schema/Test_Student__c';
import NAME_FIELD from '@salesforce/schema/Test_Student__c.Name__c';
import DOB_FIELD from '@salesforce/schema/Test_Student__c.DOB__c';
import SEX_FIELD from '@salesforce/schema/Test_Student__c.Sex__c';	
import LANGUAGES_FIELD from '@salesforce/schema/Test_Student__c.Languages__c';
import COUNTRY_FIELD from '@salesforce/schema/Test_Student__c.Country__c';
import HOBBIES_FIELD from '@salesforce/schema/Test_Student__c.Hobbies__c';

export default class RowtestStudentForm extends LightningElement {            
    @wire(MessageContext) messageContext;

    studentName = '';
    studentDOB = '';
    studentSex = '';
    studentLanguages = '';
    studentCountry = '';
    studentHobbies = '';

    handleNameChange(event) {
        this.studentName = event.target.value;
    }

    handleDOBChange(event) {
        this.studentDOB = event.target.value;
    }

    handleSexChange(event) {
        this.studentSex = event.target.value;
    }

    handleLanguagesChange(event) {
        this.studentLanguages = event.target.value;
    }

    handleCountryChange(event) {
        this.studentCountry = event.target.value;
    }

    handleHobbiesChange(event) {
        this.studentHobbies = event.target.value;
    }

    handleCreateStudent() {
        const fields = {
            [NAME_FIELD.fieldApiName]: this.studentName,
            [DOB_FIELD.fieldApiName]: this.studentDOB,
            [SEX_FIELD.fieldApiName]: this.studentSex,
            [LANGUAGES_FIELD.fieldApiName]: this.studentLanguages,
            [COUNTRY_FIELD.fieldApiName]: this.studentCountry,
            [HOBBIES_FIELD.fieldApiName]: this.studentHobbies
        };

        console.log('Fields to be sent:', fields); // Log the fields object

        createRecord({ apiName: STUDENT_OBJECT.objectApiName, fields })
            .then((student) => {
                this.showToast('Success', 'Student created successfully!', 'success');
                const payload = {
                    Id: student.id,
                    Name__c: this.studentName,
                    DOB__c: this.studentDOB,
                    Sex__c: this.studentSex,
                    Languages__c: this.studentLanguages,
                    Country__c: this.studentCountry,
                    Hobbies__c: this.studentHobbies
                };
                publish(this.messageContext, STUDENT_CHANNEL, payload);

                // Reset the input fields
                this.template.querySelectorAll('lightning-input-field').forEach(field => field.reset());
                this.studentName = '';
                this.studentDOB = '';
                this.studentSex = '';
                this.studentLanguages = '';
                this.studentCountry = '';
                this.studentHobbies = '';
            })
            .catch((error) => {
                console.error('Error creating student:', error); // Log the error object
                this.showToast('Error', `Error creating student: ${error.body.message}`, 'error');
            });
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}
