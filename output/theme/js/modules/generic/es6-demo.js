define(function (require) {
    var filter = require('lodash/collection/filter');
    var forEach = require('lodash/collection/forEach');
    var map = require('lodash/collection/map');

    var bookings = {
        dates: [],

        addDate: function addDate(date, userId) {
            this.dates.push({
                date: date,
                user: userId
            });
        },

        addDates: function addDates(dates, userId) {
            var _this = this;

            forEach(dates, function (date) {
                return _this.addDate(date, userId);
            });
        },

        getDates: function getDates() {
            var userId = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

            var dates = undefined;

            if (userId) {
                dates = filter(this.dates, function (val) {
                    return val.user === userId;
                });
            } else {
                dates = this.dates;
            }

            return dates;
        },

        dateStamps: function dateStamps() {
            return map(this.dates, function (date) {
                return date.date;
            });
        }
    };

    bookings.addDate('2015-01-01', 1);
    bookings.addDates(['2015-01-01', '2015-01-2'], 2);

    var allDates = bookings.getDates();
    var myDates = bookings.getDates(2);
    var stamps = bookings.dateStamps();

    console.log(allDates);
    console.log(myDates);
    console.log(stamps);
});