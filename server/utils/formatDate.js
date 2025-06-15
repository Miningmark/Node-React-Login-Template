export default (dateInput) => {
    const date = new Date(dateInput);

    const options = {
        timeZone: "Europe/Berlin",
        dateStyle: "short",
        timeStyle: "short"
    };

    return new Intl.DateTimeFormat("de-DE", options).format(date);
};
