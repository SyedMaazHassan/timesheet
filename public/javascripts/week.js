function formate_my_date(myDate) {
    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
    let whole_week_info = [
        [
            days[myDate.getDay()],
            `${myDate.getDate()} ${monthNames[myDate.getMonth()]}, ${myDate.getFullYear()}`
        ]
    ];

    for (let i = 0; i < 6; i++) {
        myDate.setDate(myDate.getDate() + 1);

        let single_day_info = [
            days[myDate.getDay()],
            `${myDate.getDate()} ${monthNames[myDate.getMonth()]}, ${myDate.getFullYear()}`
        ]

        whole_week_info.push(single_day_info);
    }

    // console.log(whole_week_info);
    return whole_week_info;
}

// var initial_date = "<% variable_name %>"
var initial_date = new Date("2021-04-09T12:00:00Z");
var whole_week_days = formate_my_date(initial_date);

if (!(false)) {
    var MyScheduleData = {
        monday: {
            total_hours: 0,
            all_slots: []
        },
        tuesday: {
            total_hours: 0,
            all_slots: []
        },
        wednesday: {
            total_hours: 0,
            all_slots: []
        },
        thursday: {
            total_hours: 0,
            all_slots: []
        },
        friday: {
            total_hours: 0,
            all_slots: []
        },
        saturday: {
            total_hours: 0,
            all_slots: []
        },
        sunday: {
            total_hours: 0,
            all_slots: []
        },
    }
}else{
    var MyScheduleData = {}
}

var myApp = new Vue({
    el: "#my-app",
    data: {
        week_start_date: whole_week_days[0][1],
        week_end_date: whole_week_days[whole_week_days.length - 1][1],
        edit_slot_index: -1,
        main_error: "",
        all_days: whole_week_days,
        current_day: whole_week_days[0][0],
        current_date: whole_week_days[0][1],
        current_day_hours: 0,
        days: MyScheduleData,
        from_time: "",
        to_time: "",
        description: ""
    },

    methods: {
        add_slot: function () {
            let FT = this.from_time;
            let TT = this.to_time;
            let DS = this.description;


            if (FT.length > 0) {
                this.main_error = "";
                // FT = FT+":00";
            }else{
                this.main_error = "START TIME is required!";
                return false;
            }

            if (TT.length > 0) {
                this.main_error = "";
                // TT = TT+":00";
            }else{
                this.main_error = "END TIME is required!";
                return false;
            }

            if (DS.length > 0) {
                this.main_error = "";
            }else{
                this.main_error = "DESCRIPTION is required!";
                return false;
            }

            if (FT < TT) {


                this.main_error = "";
                let duration = this.calculateTime(FT, TT);


                let new_slot =   {
                    from_time: FT,
                    to_time: TT,
                    duration: `${duration[0].hours}h ${duration[0].minutes}m`,
                    actual_duration: duration[1],
                    description: DS
                }

                if (this.edit_slot_index >= 0) {
                    this.days[this.current_day.toLowerCase()].all_slots[this.edit_slot_index] = new_slot;
                    this.edit_slot_index = -1;
                }else{
                    this.days[this.current_day.toLowerCase()].all_slots.push(
                        new_slot
                    )
                }
                this.updateTotalHours();
                this.from_time = "";
                this.to_time = "";
                this.description = "";
            }else{
                this.main_error = "End time should be ahead of the start time!";
                return false;
            }


        },

        deleteSlot: function (index) {
            if (confirm("Are you sure you want to delete this slot?")) {
                this.days[this.current_day.toLowerCase()].all_slots.splice(index, 1);
            }
            this.updateTotalHours();
        },

        editSlot: function (index) {
            this.edit_slot_index = index
            let focused_index = this.days[this.current_day.toLowerCase()].all_slots[index]
            console.log(focused_index);
            this.from_time = focused_index.from_time;
            this.to_time = focused_index.to_time;
            this.description = focused_index.description;
        },

        updateTotalHours: function () {
            let total_hours_of_the_day = 0
            let all_slots_of_day = this.days[this.current_day.toLowerCase()].all_slots;
            for (let i = 0; i < all_slots_of_day.length; i++) {
                let single_slot = all_slots_of_day[i];
                total_hours_of_the_day += single_slot.actual_duration;
                console.log(single_slot);
            }
            this.days[this.current_day.toLowerCase()].total_hours = total_hours_of_the_day;
        },

        getTotalDayHours: function (day_name) {
            let value = this.days[day_name.toLowerCase()].total_hours;
            if (value > 0) {
                value = value.toFixed(1);
            }
            return `${value}h`;
        },

        getTotalWeekHours(){
            let total_hours_of_the_week = 0;
            for (let i = 0; i < this.all_days.length; i++) {
                const element = this.all_days[i];
                total_hours_of_the_week += this.days[element[0].toLowerCase()].total_hours;
            }
            if (total_hours_of_the_week > 0) {
                total_hours_of_the_week = total_hours_of_the_week.toFixed(1);
            }

            return `${total_hours_of_the_week}h`;
        },

        change_day: function (index) {
            this.current_day = this.all_days[index][0];
            this.current_date = this.all_days[index][1];
        },

        saveData: function () {
            let whole_data = this.days;
            let total_hours_of_week = this.getTotalWeekHours();
            let new_object = {
                total_hours: total_hours_of_week,
                days: whole_data
            }
            console.log(new_object);
            console.log(JSON.stringify(new_object));

            $.ajax({
                url: ""
            })
        },

        calculateTime: function(from_time, to_time) {
            //get values
            let date1 = new Date(`01/01/2001 ${from_time}`);
            let date2 = new Date(`01/01/2001 ${to_time}`);
            let difference = date2.getTime() - date1.getTime();
            let msec = difference;
            let hh = Math.floor(msec / 1000 / 60 / 60);
            msec -= hh * 1000 * 60 * 60;
            let mm = Math.floor(msec / 1000 / 60);
            msec -= mm * 1000 * 60;
            let container = {
                "hours": hh,
                "minutes": mm,
            }
            let converted_hours = mm / 60;
            return [container, container.hours + converted_hours];
        }
    }
})