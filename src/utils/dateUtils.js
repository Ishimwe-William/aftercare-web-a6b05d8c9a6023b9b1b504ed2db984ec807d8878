import moment from "moment-timezone";

export const formatDate = (date) => {
    return moment(date).add(2, 'hours')
        // .tz("Africa/Kigali")
        .format("YYYY-MM-DD h:mm A z");
}
