import { LightningElement } from 'lwc';

export default class A extends LightningElement {
    data = [
        { id: '1', name: 'John Doe', email: 'john.doe@example.com', phone: '123-456-7890' },
        { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', phone: '234-567-8901' },
        { id: '3', name: 'Bob Johnson', email: 'bob.johnson@example.com', phone: '345-678-9012' }
    ];

    columns = [
        { label: 'Name', fieldName: 'name' },
        { label: 'Email', fieldName: 'email' },
        { label: 'Phone', fieldName: 'phone' },
        {
            type: 'action',
            typeAttributes: { rowActions: this.getRowActions }
        }
    ];

    getRowActions(row, doneCallback) {
        const actions = [
            { label: 'Edit', name: 'edit' },
            { label: 'Delete', name: 'delete' }
        ];
        doneCallback(actions);
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        if (actionName === 'edit') {
            // Handle Edit action here
            alert('Edit ' + row.name);
        } else if (actionName === 'delete') {
            // Handle Delete action here
            alert('Delete ' + row.name);
        }
    }
}
