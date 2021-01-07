$(document).ready(function () {
    loadContacts();
    addContact();
    updateContact();
});

//function to load contacts from api into HTML table
function loadContacts() {
    clearContactTable();
    var contentRows = $('#contentRows');

    $.ajax({
        type: 'GET',
        url: 'https://tsg-contactlist.herokuapp.com/contacts',
        success: function(contactArray) {
            $.each(contactArray, function(index, contact) {
                var name = contact.firstName + ' ' + contact.lastName;
                var company = contact.company;
                var contactId = contact.contactId;

                var row = '<tr>'; 
                row += '<td>' + name + '</td>';
                row += '<td>' + company + '</td>';
                row += '<td><button type="button" class="btn btn-info" onclick="showEditForm(' + contactId + ')">Edit</button></td>';
                row += '<td><button type="button" class="btn btn-danger" onclick="deleteContact(' + contactId +')">Delete</button></td>';
                row += '</tr>';

                contentRows.append(row);
                
            })

        },
        error: function() {
            $('#errorMessages')
            .append($('<li>')
            .attr({class: 'list-group-item list-group-item-danger'})
            .text('Error calling web service. Please try again later.'));
        }
    })
}

//function to collect data from #addForm and post to API service
function addContact() {
    $('#addButton').click(function (event) {
        var haveValidationErrors = checkAndDisplayValidationErrors($('#addForm').find('input'));

        if(haveValidationErrors) {
            return false;
        }

        $.ajax({
            type: 'POST',
            url: 'https://tsg-contactlist.herokuapp.com/contact',
            data: JSON.stringify({
                firstName: $('#addFirstName').val(),
                lastName: $('#addLastName').val(),
                company: $('#addCompany').val(),
                phone: $('#addPhone').val(),
                email: $('#addEmail').val(),
            }),
            headers: {
                'Accept': 'application/json',
                'Content-Type': "application/json"
            },
            'dataType': 'json',
            success: function() {
                $('#errorMessages').empty();
                $('#addFirstName').val('');
                $('#addLastName').val('');
                $('#addComapny').val('');
                $('#addPhone').val('');
                $('#addEmail').val('');
                loadContacts();                
            },
            error: function() {
                $('#errorMessages')
                .append($('<li>')
                .attr({class: 'list-group-item list-group-item-danger'})
                .text('Error calling web service. Please try again later.'));
            }
        })
    });
}

//clear contact table before loading/updating contact 
function clearContactTable() {
    $('#contentRows').empty();
    
}

//open edit contact form and load data for selected contact 
function showEditForm(contactId) {
    $('#errorMessages').empty();

    $.ajax({
        type: 'GET',
        url: 'https://tsg-contactlist.herokuapp.com/contact/' + contactId,
        success: function(data, status) {
            $('#editFirstName').val(data.firstName);
            $('#editLastName').val(data.lastName);
            $('#editCompany').val(data.company);
            $('#editPhone').val(data.phone);
            $('#editEmail').val(data.email);
            $('#editContactId').val(data.contactId);
            
        },
        error: function() {
            $('#errorMessages')
            .append($('<li>')
            .attr({class: 'list-group-item list-group-item-danger'})
            .text('Error calling web service. Please try again later.')); 
        }
    })

    $('#contactTable').hide();
    $('#editForm').show();
}

//function when closing edit form to empty all fields, hide the form, and show the table
function hideEditForm() {
    $('#errorMessages').empty();
    
    $('#editFirstName').val('');
    $('#editLastName').val('');
    $('#editCompany').val('');
    $('#editPhone').val('');
    $('#editEmail').val('');

    $('#editForm').hide();
    $('#contactTable').show();
}

//update exsiting contact with PUT request
function updateContact(contactId) {
    $('#updateButton').click(function(event) {
        var haveValidationErrors = checkAndDisplayValidationErrors($('#editForm').find('input'));

        if(haveValidationErrors) {
            return false;
        }
        $.ajax({
            type: 'PUT',
            url: 'https://tsg-contactlist.herokuapp.com/contact/' + $('#editContactId').val(),
            data: JSON.stringify({
                contactId: $('#editContactId').val(),
                firstName: $('#editFirstName').val(),
                lastName: $('#editLastName').val(),
                company: $('#editCompany').val(),
                phone: $('#editPhone').val(),
                email: $('#editEmail').val()
            }),
            headers: {
                'Acccept': 'application/json',
                'Content-Type': 'application/json'
            },
            'dataType': 'json',
            'success': function() {
                $('#errorMessages').empty();
                hideEditForm();
                loadContacts();
            },
            'error': function() {
                $('#errorMessages')
                .append($('<li>')
                .attr({class: 'list-group-item list-group-item-danger'})
                .text('Error calling web service. Please try again later.'));
            }
        })
        
    })

}

//delete record with corresponding contactId value
function deleteContact(contactId) {
    $.ajax({
        type: 'DELETE',
        url: 'https://tsg-contactlist.herokuapp.com/contact/' + contactId,
        success: function() {
            loadContacts();
        }
    });
}
//collect and display validation error messages 
function checkAndDisplayValidationErrors(input) {
    $('#errorMessages').empty();

    var errorMessages = [];

    //generate specific message using form label and browser generated error messages
    input.each(function() {
        if (!this.validity.valid) {
            var errorField = $('label[for=' + this.id + ']').text();
            errorMessages.push(errorField + ' ' + this.validationMessage);
        }
    });

    //display messages in #errorMessages div
    if (errorMessages.length > 0) {
        $.each(errorMessages, function(index, message) {
            $('#errorMessages')
            .append($('<li>')
            .attr({class: 'list-group-item list-group-item-danger'})
            .text(message));
        });
        //return true, indicating errors
        return true;
    } else {
        //return false. indicating no errors
        return false;
    }
}