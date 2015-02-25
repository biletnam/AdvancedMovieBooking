var settings = {
    goldRows: 2,
    goldSeats: 10,
    silverRows: 3,
    silverSeats: 10,
    bronzeRows: 4,
    bronzeSeats: 10,
    seat:'seat',
    selectedSeat : 'selectedSeat',
    availableSeat : 'availableSeat',
    reservedSeat : 'reservedSeat',
    reservedUsers : {},
    seats : [],
    users: [],
    rowCount: -1
};
//user constructor
var newUser = function(){
    this.userName = '';
    this.seatCount = '';
    this.classSeat = '';
    this.selectedSeats = [];
};
//seat constructor
var newSeat = function(seatNo,classSeat) {
    this.no = seatNo;
    this.isReserved = false;
    this.isSelected = false;
    this.classSeat = classSeat;
};
newSeat.prototype.reserve = function (id) {
    var seat = $.grep(settings.seats,function(item){return item.no == id;});
    if (seat.length>0){
        seat[0].isReserved = true;
    }
};


// generate seats.
// provide table id to add rows, number of rows, number of seats(columns) and type of seat.
var generateSeats = function (tableId,rows,seats,seatClass) {
    var row = '';
    for(var i=0;i<rows;i++) {
        settings.rowCount++;
        row = "<tr>";
        for (var j = 0; j < seats; j++) {
            row += "<td><div id='" + String.fromCharCode(65 + settings.rowCount) + (j+1) + "' class='seat "+seatClass+"'>" + "</div></td>";
            var seat = new newSeat(String.fromCharCode(65 + settings.rowCount) + (j+1),seatClass);
            settings.seats.push(seat);
        }
        row += "</tr>";

        $('#'+tableId).append(row);
    }
};

var seatToAdd = new newSeat();
var currentUser = new newUser();

var checkSeats = function (id) {
    var seat = $.grep(settings.seats,function(item){return item.no == id;});
    if(seat.length>0){
        return seat[0].classSeat === currentUser.classSeat;
    }
};

var checkAdjacentSeats = function (id) {
    var thisSeat = $('#'+id);
    if(!thisSeat.hasClass(settings.selectedSeat)) {
        return thisSeat.parent().next().find('div').hasClass(settings.selectedSeat) || thisSeat.parent().prev().find('div').hasClass(settings.selectedSeat);
    }
    else {
        return true;
    }
};

var checkSingleSeatSilo = function (id) {
    var thisSeat = $('#'+id);
    var seatsPerRow = thisSeat.hasClass('gold')?settings.goldSeats:thisSeat.hasClass('silver')?settings.silverSeats:thisSeat.hasClass('bronze')?settings.bronzeSeats:'';
    console.log(seatsPerRow);
    var lastSeat = thisSeat.parent().parent().find('td:last div').attr('id');
    var firstSeat = thisSeat.parent().parent().find('td:first div').attr('id');
    var selectedSeats = thisSeat.parent().parent('tr').find('div.selectedSeat');
    var firstSelectedSeat = $('#'+(selectedSeats[0].id));
    var lastSelectedSeat = $('#'+(selectedSeats[selectedSeats.length - 1].id));
    if(thisSeat.attr('id') !== firstSeat &&  thisSeat.attr('id') !== lastSeat && currentUser.selectedSeats.length < seatsPerRow -2 && currentUser.seatCount !=2) {
        return thisSeat.parent().next().next().length === 0
            || thisSeat.parent().prev().prev().length === 0
            || firstSelectedSeat.parent().next().next().length === 0 && !$('#'+lastSeat).hasClass(settings.selectedSeat)
            || firstSelectedSeat.parent().prev().prev().length === 0 && !$('#'+firstSeat).hasClass(settings.selectedSeat)
            || lastSelectedSeat.parent().prev().prev().length === 0 && !$('#'+firstSeat).hasClass(settings.selectedSeat)
            || lastSelectedSeat.parent().next().next().length === 0 && !$('#'+lastSeat).hasClass(settings.selectedSeat);
    }
    else if(currentUser.seatCount ==2 && thisSeat.attr('id') != lastSeat && thisSeat.attr('id') != firstSeat){
        return thisSeat.parent().prev().prev().length === 0 && !$('#'+firstSeat).hasClass(settings.selectedSeat)
            || thisSeat.parent().next().next().length === 0 && !$('#'+lastSeat).hasClass(settings.selectedSeat)
            || firstSelectedSeat.parent().prev().prev().length === 0 && !$('#'+firstSeat).hasClass(settings.selectedSeat)
            || lastSelectedSeat.parent().next().next().length === 0 && !$('#'+lastSeat).hasClass(settings.selectedSeat);
    }
    else{
        return false;
    }
};

$(document).ready(function () {
    generateSeats("tblSeats",settings.goldRows,settings.goldSeats,"gold");
    generateSeats("tblSeats",settings.silverRows,settings.silverSeats,"silver");
    generateSeats("tblSeats",settings.bronzeRows,settings.bronzeSeats,"bronze");

    // enable select seats button when no. of seats is selected.
    $('#ddlSeats').change(function(){
        if($('#ddlSeats').val()!='Select') {
            $('#btnSelectSeats').removeAttr('disabled');
        }
    });

    // on click of select seats, check if the user name and no. of seats are selected and display seats.
    $('#btnSelectSeats').click(function (event) {
        if($('#txtName').val()===''){
            alert('Please enter your name.');
            event.preventDefault();
        }
        else if($('#ddlSeats').val()==='select'){
            alert('Please select no. of seats needed.');
            event.preventDefault();
        }
        else if($('#ddlSeatClass').val() === 'select'){
            alert('Please select a class.');
            event.preventDefault();
        }
        else{
            $('#seatsReserve').css('display','block');
            currentUser.userName = $('#txtName').val();
            currentUser.seatCount = $('#ddlSeats option:selected').val();
            currentUser.classSeat = $('#ddlSeatClass option:selected').val();
            $(this).attr('disabled','disabled');
        }

    });

    var count = 0;

    // click event for the seat.
    $('#tblSeats').on('click','div.seat', function (event) {
        if($('#btnReserve').is('[disabled]')){
            $('#btnReserve').removeAttr('disabled');
        }
        if(!checkSeats(event.target.id)){
            alert('You should select only '+currentUser.classSeat+' seats.');
            event.preventDefault();
        }
        else if(currentUser.selectedSeats.length>0 && !checkAdjacentSeats(event.target.id)) {
            alert('Please select adjacent seats.');
            event.preventDefault();
        }
        else {

            // if the seat is already selected, deselect it.
            if ($(this).hasClass(settings.selectedSeat)) {
                $(this).removeClass(settings.selectedSeat);
                // remove the selected seats from the selectedSeats array.
                currentUser.selectedSeats = $.grep(currentUser.selectedSeats, function (item) {
                    return item != event.target.id;
                });
                count--;
            }
            // if the seat is available, then add to selected seats.
            else {
                if(count === currentUser.seatCount -1 && currentUser.selectedSeats.length!==0 && checkSingleSeatSilo(event.target.id)) {
                    alert('Please do not create single seat silos.');
                    event.preventDefault();
                }
                else if (count < currentUser.seatCount) {
                    $(this).addClass(settings.selectedSeat);
                    currentUser.selectedSeats.push(event.target.id);
                    count++;
                }
                else {
                    alert('You have selected specified number of seats.');
                }
            }

        }
    });

    // reserve seats and add the user to users array.
    $('#btnReserve').click(function (event) {
        if(currentUser.seatCount !== currentUser.selectedSeats.length.toString()){
            alert('Please select '+currentUser.seatCount+' seats.');
            event.preventDefault();
        }
        else {
            settings.users.push(currentUser);
            $.each(currentUser.selectedSeats, function (seat) {
                var thisSeat = $('#' + currentUser.selectedSeats[seat]);
                thisSeat.removeClass(settings.selectedSeat);
                thisSeat.removeClass(settings.seat);
                thisSeat.addClass(settings.reservedSeat);
                seatToAdd.reserve(currentUser.selectedSeats[seat]);
            });
            currentUser = new newUser();
            count = 0;
            $('#seatsReserve').css('display', 'none');
            $('#txtName').val('');
            $('#ddlSeatClass').val('Select');
            $('#ddlSeats').val('Select');
            $('#btnShowReservations').css('display', 'block');
        }
    });

    // display the reserved users in a table.
    $('#btnShowReservations').click(function () {
        $('#tblReserve').css('display','table');
        $("#tblReserve").find("tr:gt(0)").remove();
        $.each(settings.users, function (user) {
            var thisUser = settings.users[user];
            $('#tblReserve').append(
                "<tr><td>"+
                thisUser.userName+
                "</td><td>"+
                thisUser.seatCount+
                "</td><td>"+
                thisUser.selectedSeats+
                "</td></tr>"
            );
        });
    });
});