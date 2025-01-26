import PhonebookEntryObject from "../objects/PhonebookEntryObject.js";
import NotificationObject from "../objects/NotificationObject.js";
import { config } from "../config.json";

function AddNewPhonebookEntryFormComponent({
  phonebook,
  updatePhonebook,
  newName,
  setNewName,
  notifications,
  setNotifications,
  newPhoneNumber,
  setNewPhoneNumber,
  phonebookClient,
}) {
  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const entry = new PhonebookEntryObject(
      form.newName.value,
      form.newPhoneNumber.value,
    );

    const alreadyExistingIdx = phonebook.findIndex(
      (e) => e.name === entry.name,
    );
    const isUpdate = alreadyExistingIdx !== -1;
    console.log(`isUpdate: ${isUpdate}`);
    if (isUpdate) {
      const alreadyExistingEntry = phonebook[alreadyExistingIdx];
      const isNewPhoneNumberConfirmed = confirm(
        `This name already exists in phonebook. Do you want to update the phone number?`,
      );
      if (isNewPhoneNumberConfirmed) {
        const updatedEntry = {};
        try {
          updatedEntry.entry = await phonebookClient.update(
            alreadyExistingEntry.id,
            new PhonebookEntryObject(entry.name, entry.phoneNumber),
          );
        } catch (error) {
          console.error(error);
          if (error.status === 404) {
            const alreadyDeletedNotification = NotificationObject.newWarning(
              `${entry.name}'s phone number has already been deleted!`,
            );
            addNotification(alreadyDeletedNotification);

            const fetchedPersons = await phonebookClient.getAll();
            const phonebook = fetchedPersons.map((person) =>
              PhonebookEntryObject.fromJson(person),
            );
            updatePhonebook(phonebook);
          } else {
            const errorNotification = NotificationObject.newWarning(
              error.response.data.message,
            );
            addNotification(errorNotification);
          }
          return;
        }

        const newPhonebook = phonebook.map((e) =>
          e.id === updatedEntry.entry.id ? updatedEntry.entry : e,
        );
        updatePhonebook(newPhonebook);
        const phoneUpdatedNotification = NotificationObject.newInfo(
          `${entry.name}'s phone number has been updated!`,
        );
        addNotification(phoneUpdatedNotification);
      }
      return;
    }

    // save
    try {
      await phonebookClient.save(entry);
    } catch (error) {
      console.error(error);
      const data = error.response.data;
      const message = {};
      if (data.errorType === "ValidationError") {
        message.message = extractValidationErrorMessage(data.message);
      } else {
        message.message = data.message;
      }
      const errorNotification = NotificationObject.newWarning(message.message);
      addNotification(errorNotification);
      return;
    }

    const newPhonebook = phonebook.concat(entry);
    updatePhonebook(newPhonebook);
    setNewName("");
    setNewPhoneNumber("");
    const personAddedNotification = NotificationObject.newInfo(
      `Added "${entry.name}" to the phonebook!`,
    );
    addNotification(personAddedNotification);
  }

  function extractValidationErrorMessage(message) {
    return message.match(/.* validation failed: (.*)/s)[1];
  }

  function addNotification(notification) {
    const removeAt = Date.now() + config.notification.displayTime;
    const newNotifications = new Map([
      ...notifications,
      [removeAt, notification],
    ]);
    setNotifications(newNotifications);
  }

  function handleOnNameChange(event) {
    const input = event.target;
    setNewName(input.value);
  }

  function handleOnPhoneNumberChange(event) {
    const input = event.target;
    setNewPhoneNumber(input.value);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          alignItems: "flex-start",
          width: "300px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <label htmlFor="newName">Name</label>
        <input
          placeholder="Enter a name..."
          type="text"
          name="newName"
          value={newName}
          onChange={handleOnNameChange}
        />
        <br />
        <label htmlFor="newPhoneNumber">Phone number</label>
        <input
          placeholder="Enter a phone number..."
          type="text"
          name="newPhoneNumber"
          value={newPhoneNumber}
          onChange={handleOnPhoneNumberChange}
        />
        <button type="submit">Add entry</button>
      </div>
    </form>
  );
}

export default AddNewPhonebookEntryFormComponent;
