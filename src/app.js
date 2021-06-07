// map box api key
const mapbox_api_key = 'pk.eyJ1Ijoic2hhZG93ZW1vbiIsImEiOiJja3A2YTNxOG0wMGE1MnZwYnhuYmxwbXQ2In0.M0OtxUPbfjRNmbKrgTgrkg'

// get element id of starting_location , desgination , Trip-plan and mytirp and value for press enter.
let origin = document.getElementById('origins');
let Starting_location = document.getElementById("Starting_location");
let starting_location_error = document.getElementById("starting_location_error");
let destination_input = document.getElementById("destination_input");
let destination_error = document.getElementById("destination_error");
let destinations = document.getElementById('destinations');

Starting_location.addEventListener("keydown", function (event) {
    // if(event.code === 'Enter') {
   if (event.keyCode === 13) {
       event.preventDefault();
       let origin_value = Starting_location.value;
       if (origin_value == "") {
           starting_location_error.style.display = 'block'
           starting_location_error.innerHTML = 'Please provide a starting location first'
       } else {
           starting_location_error.style.display = 'none'
           getPlaces(origin_value, origin, starting_location_error);
       }
   }
});

//function for enter key.
destination_input.addEventListener("keydown", function (event) {
     // if(event.code === 'Enter') {
    if (event.keyCode === 13) {
        event.preventDefault();
        let destination_value = destination_input.value;
        if (destination_value == "") {
            destination_error.style.display = 'block'
            destination_error.innerHTML = 'Please provide a destination first'
        } else {
            destination_error.style.display = 'none'
            getPlaces(destination_value, destinations, destination_error);
        }
    }
});

destinations.addEventListener('click', function (e) {
    destinations.querySelectorAll('.selected').forEach(n => n.classList.remove('selected'))
    e = e || window.event;
    let target = e.target || e.srcElement,
            text = target.textContent || target.innerText;
    target.parentNode.className = 'selected';
},
false);


//Winnipeg transit api key
const transit_API = 'Xf2XhbFqkk-DeNRN3CmA';

let Trip_Planing = document.getElementById('plan_trip');
let My_Trip_Planing = document.getElementById('my_trip');



// Setting the search limit within the Winnipeg.
async function getPlaces(search, parentDiv, errorElement) {
    const bboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${search}.json?bbox=-97.325875,49.766204,-96.953987,49.99275&access_token=${mapbox_api_key}`;
    fetch(bboxUrl)
            .then((response) => {
                return response.json();
            })
            .then((databbox) => {
                prepareHtml(databbox.features, parentDiv, errorElement);
            });

}


Starting_location.addEventListener("keydown", function (event) {
     // if(event.code === 'Enter') {
    if (event.keyCode === 13) {
        event.preventDefault();
        let origin_value = Starting_location.value;
        if (origin_value == "") {
            starting_location_error.style.display = 'block'
            starting_location_error.innerHTML = 'Please provide a starting location first'
        } else {
            starting_location_error.style.display = 'none'
            getPlaces(origin_value, origin, starting_location_error);
        }
    }
});

origin.addEventListener('click', function (e) {
    // clear previous select and add new select
    origin.querySelectorAll('.selected').forEach(n => n.classList.remove('selected'))

    e = e || window.event;
    let target = e.target || e.srcElement,
            text = target.textContent || target.innerText;
    target.parentNode.className = 'selected';
}, 
false);


//click on "plan my trip"
Trip_Planing.addEventListener('click', function (e) {
    let origindataset = '', destinationdataset = '';
    origin.querySelectorAll('.selected').forEach(n => origindataset = n.dataset);
    destinations.querySelectorAll('.selected').forEach(n => destinationdataset = n.dataset);
    let html = '';
    if (origindataset == '') {
        html = '<li>' +
                '<i class="fas fa-location-arrow"></i> Please select a starting location!' +
                '</li>'
    }
    // if destination not select show "Please select origin First".
    else if (destinationdataset == '') {
        html = '<li>' +
                '<i class="far fa-map"></i> Please select destination!' +
                '</li>'
    } else if (origindataset.lat == destinationdataset.lat && origindataset.long == destinationdataset.long) {
        html = '<li>' +
                '<i class="fas fa-exclamation"></i> Starting location and destination should not be same!' +
                '</li>'
    }
    if (html != '') {
        My_Trip_Planing.innerHTML = html;
    } else {
        My_Trip_Planing.innerHTML = '';
        tripPlan(origindataset, destinationdataset);
    }

}, 
false);

async function tripPlan(origindataset, destinationdataset) {

    // transit api url
    const transitApiUrl = `https://api.winnipegtransit.com/v3/trip-planner.json?api-key=${transit_API}&origin=geo/${origindataset.lat},${origindataset.long}&destination=geo/${destinationdataset.lat},${destinationdataset.long}`;

    fetch(transitApiUrl)
            .then((response) => {
                if (response.status == 500) {
                    My_Trip_Planing.innerHTML = '<li>' +
                            '<i class="fas fa-ban"></i> Starting location or Destination is Invalid or no bus is currently available' +
                            '</li>'
                }
                return response.json();
            }).then((data) => {
        let html = '';
        for (let i = 0; i < data.plans.length; i++) {
            let segments = data.plans[i].segments;
            if (i == 0) {
                html = '<h3>Recommend trip</h3>';
            } else {
                html = '<h3>More trips ' + i + '</h3>';
            }
            let icons = {'walk': 'fa-walking', 'ride': 'fa-bus', 'transfer': 'fa-ticket-alt'}
            for (let j = 0; j < segments.length; j++) {
                html += '<li>' +
                        '<i class="fas ' + icons[segments[j].type] + '" aria-hidden="true"></i>' + ResultMessage(segments[j]) +
                        '</li>'
            }
            My_Trip_Planing.innerHTML += html;
        }
    }).catch(function () {
        My_Trip_Planing.innerHTML = '<li>' +
                '<i class="fas fa-bus"></i> Winnipeg bus service is currently unavailable. Sorry for the inconvenience. Check another time!' +
                '</li>'
    });
}

//setting origin and destination
async function prepareHtml(list, parentDiv, errorElement) {
    let html = '';
    if (list.length > 0) {
        for (let i = 0; i < list.length; i++) {
            html += '<li data-long="' + list[i].geometry.coordinates[0] + '" data-lat="' + list[i].geometry.coordinates[1] + '">' +
                    '<div>' + list[i].place_name + '</div>' +
                    '</li>';
        }
        parentDiv.innerHTML = html;
    } else {
        errorElement.style.display = 'block'
        errorElement.innerHTML = 'No location found. Check your keywords'
    }
}


//Showing the Appropriate and recommended Trip results.
function ResultMessage(ResultMessage) {
    let message = '';
    if (ResultMessage.type == 'walk') {
        if (!ResultMessage.to && ResultMessage.times.durations) {
            message = 'Walk for ' + ResultMessage.times.durations.walking + ' minutes to your destination'
        } else if (ResultMessage.to.stop) {
            message = 'Walk for ' + ResultMessage.times.durations.walking + ' minutes to next stop #' + ResultMessage.to.stop.key + ' - ' +
                    ResultMessage.to.stop.name;
        } else {
            message = 'Walk for ' + ResultMessage.times.durations.walking + ' minutes to your destination'
        }
    } else if (ResultMessage.type == 'ride') {
        message = 'Ride the ' + ResultMessage.route.name
    } else if (ResultMessage.type == 'transfer') {
        message = 'Transfer from stop ' + ResultMessage.from.stop.key + ' - ' + ResultMessage.from.stop.name
    }
    return message;

}       