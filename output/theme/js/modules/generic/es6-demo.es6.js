define((require) => {
    const filter = require('lodash/collection/filter');
    const forEach = require('lodash/collection/forEach');
    const map = require('lodash/collection/map');


    let bookings = {
        dates: [],

        addDate (date, userId) {
            this.dates.push({
                date,
                user: userId
            });
        },

        addDates (dates, userId) {
            forEach(dates, (date) => this.addDate(date, userId));
        },

        getDates (userId = 0) {
            let dates;

            if (userId) {
                dates = filter(this.dates, (val) => val.user === userId);
            } else {
                dates = this.dates;
            }

            return dates;
        },

        dateStamps () {
            return map(this.dates, (date) => date.date);
        }
    };

    bookings.addDate('2015-01-01', 1);
    bookings.addDates(['2015-01-01', '2015-01-2'], 2);

    let allDates = bookings.getDates();
    let myDates = bookings.getDates(2);
    let stamps = bookings.dateStamps();

    console.log(allDates);
    console.log(myDates);
    console.log(stamps);
});
