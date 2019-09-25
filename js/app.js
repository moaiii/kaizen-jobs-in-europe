var job_array = [];
var country_array;

var min_income = 0;
var max_hours = 0;
var min_leave = 0;
var min_holidays = 0;

var slider1;
var slider2;
var slider3;
var slider4;

var uk = true;

var isMobile = false;

$(function(){

    checkCurrancy();

    // Load Jobs
    $.getJSON('jobs.json', function(data){
        console.log(data)

        if($(window).width() < 991){
            $('.choose-by-job').append('<option data-icon="fa fa-briefcase" value="none">Choose Job</option>');
        } else {
            $('.choose-by-job').append('<option data-icon="fa fa-briefcase" value="none">Choose by Job</option>');
        }
        $.each(data, function(i, v){
            job_array.push(v);
            // Add to select options
            $('.choose-by-job').append('<option value="'+i+'" data-icon="fa fa-briefcase">'+v.job+'</option>');
        });

    });
    // Load Counties
    $.getJSON('countries.json', function(data){

        country_array = data;
        if($(window).width() < 991){
            $('.choose-by-country').append('<option data-icon="fa fa-map-marker" value="none">Choose Country</option>');
        } else {
            $('.choose-by-country').append('<option data-icon="fa fa-map-marker" value="none">Choose by Country</option>');
        }

        $.each(data, function(i, v){
            // Add to select options
            $('.choose-by-country').append('<option data-icon="fa fa-map-marker" value="'+i+'">'+v.name+'</option>');
        });

        setTimeout(function(){
            $('.choose-by-job').selectpicker();
            $('.choose-by-country').selectpicker();
            $('.filteroptions').selectpicker();
            showTable('#countryTable', country_array);
        }, 500);

        // Show Top Counties for the first screen
        //showTable('#countryTable', country_array);

    });

    $('.advanced-filters-btn').click(function(e){
        e.preventDefault();
        $('.sub-section').toggleClass('open');
        setTimeout(function(){
              checkMobile();
        }, 200);
    });

    // Toggle Checkboxes
    $('#min_income_check').change(function(){
        if($(this).is(':checked')){
            min_income = $("#min_income").val();
        } else {
            min_income = 0;
        }
        $('#countryTable').DataTable().draw();
    });

    $('#max_hours_check').change(function(){
        if($(this).is(':checked')){
            max_hours = $("#max_hours").val();
        } else {
            max_hours = 0;
        }
        $('#countryTable').DataTable().draw();
    });

    $('#min_leave_check').change(function(){
        if($(this).is(':checked')){
            min_leave = $("#min_leave").val();
        } else {
            min_leave = 0;
        }
        $('#countryTable').DataTable().draw();
    });

    $('#min_holidays_check').change(function(){
        if($(this).is(':checked')){
            min_holidays = $("#min_holidays").val();
        } else {
            min_holidays = 0;
        }
        $('#countryTable').DataTable().draw();
    });

    // Mobile stuff
    $('.mobile-nav a').click(function(e){
        e.preventDefault();

        // Check if this has active,
        // If so, hide the mobile pane
        // Else click active

        if($(this).hasClass('active')){
            // Hide Pane
            $('#'+$(this).attr('href').substring(1)).removeClass('active');
            $(this).removeClass('active');
        } else {
            $('.mobile-pane').removeClass('active');
            $('.mobile-nav a').removeClass('active');

            $(this).addClass('active');
            $('#'+$(this).attr('href').substring(1)).addClass('active');
        }

        console.log($(this).attr('href').substring(1));
    });

    if($(window).width() < 991){
        $('.ad-filters-con').appendTo('#mob-tab-3');

        $('.ad-filters-con').append('<button class="btn btn-yellow" onclick="return applyFilters();">Apply</button>');

        $('.mobile-nav .choose-by-job').on('show.bs.select', function (e) {
            $('.mobile-nav li:last-child a').removeClass('active');
            $('.mobile-pane').removeClass('active');
        });

        $('.mobile-nav .choose-by-country').on('show.bs.select', function (e) {
            $('.mobile-nav li:last-child a').removeClass('active');
            $('.mobile-pane').removeClass('active');
        });
    }

});


function checkCurrancy(){
    $.get('ipchecker.php', function(data){
        if(data == "US"){
            uk = false;
        } else {
            uk = true;
        }
    });
}


function pickJob(){

    // Get job name from index
    $('.choose-by-country').val('none');
    $('.choose-by-country').selectpicker('render');
    $('.choose-by-country').removeClass('activeselect');

    if($('.choose-by-job option:selected').val() == "none"){
        // remove yellow
        $('.choose-by-job').removeClass('activeselect');
    } else {
        $('.choose-by-job').addClass('activeselect');
    }

    //console.log($('.choose-by-job option:selected').val());

    var job = job_array[$('.choose-by-job option:selected').val()].job;

    // Filter each job, then add country info

    var specific_job_array = [];

    $.each(job_array, function(i, v){
        if(v.job == job){
            $.each(v.countries, function(ii, vv){
                $.each(country_array, function(iii, vvv){
                    if(vvv.name == vv.country){
                        var obj = {};
                        obj.job = v.job;
                        obj.name = vv.country;
                        obj.icon = vvv.icon;
                        obj.average_income = vv.salary;
                        obj.score = vv.score;
                        obj.average_disposable_income = vvv.average_disposable_income;
                        obj.actual_weekly_hours_worked = vvv.actual_weekly_hours_worked;
                        obj.average_annual_leave = vvv.average_annual_leave;
                        obj.average_bank_holidays = vvv.average_bank_holidays;
                        obj.score = vv.score;
                        specific_job_array.push(obj);
                    }
                });
            });
        }
    });

    //console.log(specific_job_array);

    $('[data-advanced-filters]').addClass('show');

    $('[data-country-facts]').removeClass('show');

    $('.sub-section').addClass('open');

    $('.advanced-filters-btn').show();

    setTimeout(function(){
          checkMobile();
    }, 200);

    showTable('#countryTable', specific_job_array);
}

function pickCountry(){

    // Choose a job select reset
    $('.choose-by-job').val('none');
    $('.choose-by-job').selectpicker('render');
    $('.choose-by-job').removeClass('activeselect');

    if($('.choose-by-country option:selected') == "none"){
        // remove yellow
        $('.choose-by-country').removeClass('activeselect');
    } else {
        $('.choose-by-country').addClass('activeselect');
    }

    var country = country_array[$('.choose-by-country option:selected').val()].name;
    // Get the name of the country from the index
    // Filter each job for the specific country name

    var specific_country_array = [];

    $.each(job_array, function(i, v){
        var obj = {};
        obj.name = v.job;
        $.each(v.countries, function(ii, vv){
            if(vv.country == country){
                obj.country = vv.country;
                obj.salary = vv.salary;
                obj.score = vv.score;
            }
        });
        specific_country_array.push(obj);
    });

    $('[data-advanced-filters]').removeClass('show');

    // Add the country data
    $('[data-weekly-hours-fact]').html(country_array[$('.choose-by-country option:selected').val()].actual_weekly_hours_worked);
    $('[data-annual-leave-fact]').html(country_array[$('.choose-by-country option:selected').val()].average_annual_leave);
    $('[data-bank-holidays-fact]').html(country_array[$('.choose-by-country option:selected').val()].average_bank_holidays);
    $('[data-income-fact]').html('£'+Number(country_array[$('.choose-by-country option:selected').val()].average_disposable_income).toLocaleString('en'));

    $('[data-country-facts]').addClass('show');

    $('.sub-section').addClass('open');

    $('.advanced-filters-btn').hide();

    setTimeout(function(){
          checkMobile();
    }, 200);

    showTable('#jobsTable', specific_country_array);
}

function showTable(table, array){

    if ( $.fn.DataTable.isDataTable('#countryTable') ) {
        $('#countryTable').DataTable().destroy();
    }
    if ( $.fn.DataTable.isDataTable('#jobsTable') ) {
        $('#jobsTable').DataTable().destroy();
    }

    if(isMobile){
        // Scroll content back to top, left
        $('.content').scrollTop(0);
        $('.content').scrollLeft(0);
    }

    $('#countryTable').hide();
    $('#jobsTable').hide();

    $('#jobsTable tbody').empty();
    $('#countryTable tbody').empty();

    $('#jobsTable tbody').html('');
    $('#countryTable tbody').html('');

    if(table == '#countryTable'){
        $.each(array, function(i, v){
            $(' '+table+' tbody ').append('<tr class=" '+(v.name == "United Kingdom" && uk ? "selected" : "")+' " >'+
                '<td>1</td>'+
                '<td><img class="flag" src="img/icons/'+v.icon+'"> '+v.name+'</td>'+
                '<td>£'+Number(v.average_income).toLocaleString('en')+'</td>'+
                '<td>'+v.actual_weekly_hours_worked+'</td>'+
                '<td>'+v.average_annual_leave+'</td>'+
                '<td>'+v.average_bank_holidays+'</td>'+
                '<td>£'+Number(v.average_disposable_income).toLocaleString('en')+'</td>'+
                '<td style="display:none;">'+v.score+'</td>'+
            '</tr>');
        });
    } else {
        $.each(array, function(i, v){
            $(' '+table+' tbody ').append('<tr>'+
                '<td>1</td>'+
                '<td><img class="flag" src="img/icons/'+v.name.replace(/\s+/g, '-').replace(/\//g, '').toLowerCase()+'.svg"> '+v.name+'</td>'+
                '<td>£'+Number(v.salary).toLocaleString('en')+'</td>'+
            '</tr>');
        });
    }

    $(' '+table+' ').show();
    if(table == "#countryTable"){
        var rank = 0;
        $(' '+table+' ').DataTable({
            "paging": false,
            "bLengthChange": false,
            "bInfo" : false,
            "order": [7, "desc"],
            initComplete: function () {
                var rank  = 1;
                $('#countryTable tbody tr').each(function(){
                    $(this).find('td').first().text(rank);
                    rank++;
                });


                    // Set up slider,
                    // On change, trigger draw
                    $("#min_income").ionRangeSlider({
                          hide_from_to: true,
                          grid: false,
                          postfix: " K",
                          min: 0,
                          from: min_income,
                          step: 1,
                          max: 50,
                          onChange: function (data) {
                              data.slider.parent().find('.single').html(data.from+" K");
                          },
                          onFinish: function(data){
                              min_income = data.from;
                              if($('#min_income_check').is(':checked')){
                                  $(' '+table+' ').DataTable().draw();
                              }
                          },
                          onStart: function (data) {
                              console.log('start');
                              data.slider.parent().find('.single').html("0 K");
                              $(' '+table+' ').DataTable().draw();
                          }
                    });
                    slider1 = $("#min_income").data("ionRangeSlider");


                    $("#max_hours").ionRangeSlider({
                          hide_from_to: true,
                          grid: false,
                          min: 0,
                          from: max_hours,
                          step: 1,
                          max: 40,
                          onChange: function (data) {
                              data.slider.parent().find('.single').html(data.from);
                          },
                          onFinish: function(data){
                              max_hours = data.from;
                              if($('#max_hours_check').is(':checked')){
                                  $(' '+table+' ').DataTable().draw();
                              }
                          },
                          onStart: function (data) {
                              data.slider.parent().find('.single').html("0");
                              $(' '+table+' ').DataTable().draw();
                          }
                    });
                    slider2 = $("#max_hours").data("ionRangeSlider");



                    $("#min_leave").ionRangeSlider({
                          hide_from_to: true,
                          grid: false,
                          min: 0,
                          step: 1,
                          from: min_leave,
                          max: 30,
                          onChange: function (data) {
                              data.slider.parent().find('.single').html(data.from);
                          },
                          onFinish: function(data){
                              min_leave = data.from;
                              if($('#min_leave_check').is(':checked')){
                                  $(' '+table+' ').DataTable().draw();
                              }
                          },
                          onStart: function (data) {
                              data.slider.parent().find('.single').html("0");
                              $(' '+table+' ').DataTable().draw();
                          }
                    });
                    slider3 = $("#min_leave").data("ionRangeSlider");


                    $("#min_holidays").ionRangeSlider({
                          hide_from_to: true,
                          grid: false,
                          min: 0,
                          step: 1,
                          from: min_holidays,
                          max: 20,
                          onChange: function (data) {
                              data.slider.parent().find('.single').html(data.from);
                          },
                          onFinish: function(data){
                              min_holidays = data.from;
                              if($('#min_holidays_check').is(':checked')){
                                  $(' '+table+' ').DataTable().draw();
                              }
                          },
                          onStart: function (data) {
                              data.slider.parent().find('.single').html("0");
                              $(' '+table+' ').DataTable().draw();
                          }
                    });
                    slider4 = $("#min_holidays").data("ionRangeSlider");


                this.api().columns().every( function () {

                    var column = this;
                    var cindex = column[0][0];

                    var header = column.header();

                } );
            }
        });
    } else {
        $(' '+table+' ').DataTable({
            "paging": false,
            "searching": false,
            "bLengthChange": false,
            "bInfo" : false,
            "order": [2, "desc" ],
            initComplete: function () {
                $('select.filteroptions').empty();
                var rank  = 1;

                $('#jobsTable tbody tr').each(function(){
                    $(this).find('td').first().text(rank);
                    rank++;
                });

                this.api().columns().every( function () {

                    var column = this;
                    var cindex = column[0][0];

                    var header = column.header();
               });
           }
        });
    }

    checkMobile();

}

function customSortTable(){

    if ( $.fn.DataTable.isDataTable('#countryTable') ) {
        $('#countryTable').DataTable().order([$('.filteroptions option:selected').val(), 'desc']).draw();
    }
    if ( $.fn.DataTable.isDataTable('#jobsTable') ) {
        $('#jobsTable').DataTable().order([$('.filteroptions option:selected').val(), 'desc']).draw();
    }

    return false;
}

$.fn.dataTable.ext.search.push(
    function( settings, data, dataIndex ) {

        if($('#max_hours_check').is(':checked')){
            max_hours_tmp = max_hours;
        } else {
            max_hours_tmp = 40;
        }

        if ( min_income * 1000 <= parseInt(data[6].toString().replace(",", "").replace("£", "")) && max_hours_tmp >= data[3] && min_leave <= data[4] && min_holidays <= data[5])
        {
            return true;
        }

        return false;
    }
);

function checkMobile(){
    if(($('.content').outerHeight() + $('.sub-section').outerHeight() + $('#header').outerHeight() + $('#footer').outerHeight()) < $(window).height()){
        $('#footer').addClass('sticky');
    } else {
        $('#footer').removeClass('sticky');
    }

    if($(window).width() < 991){
        isMobile = true;
        $('.search-drop-form .choose-by-job').remove();
        $('.search-drop-form .choose-by-country').remove();
    } else {
        isMobile = false;
    }
}

function resetTable(){

    min_income = 0;
    max_hours = 0;
    min_leave = 0;
    min_holidays = 0;

    $('#min_income_check').attr('checked', false);
    $('#max_hours_check').attr('checked', false);
    $('#min_leave_check').attr('checked', false);
    $('#min_holidays_check').attr('checked', false);

    slider1.reset();
    slider2.reset();
    slider3.reset();
    slider4.reset();


    if($('.choose-by-country option:selected').val() == "none" && $('.choose-by-job option:selected').val() == "none"){
        showTable('#countryTable', country_array);
    } else if($('.choose-by-country option:selected').val() != "none"){
        pickCountry($('.choose-by-country option:selected'));
    } else {
        // Reset advanced-filters
        pickJob($('.choose-by-job'));
    }

    return false;
}

function discover(){
    // Add Overlay
    $('.overlay').addClass('show');

    var clicks = 0;

    if(isMobile){

        $('.overlay').append('<div class="tmp-select-display" style="position:absolute; width: '+$('.mobile-nav li:first-child').outerWidth()+'px; top: '+$('.mobile-nav li:first-child').offset().top+'px; left: '+$('.mobile-nav li:first-child').offset().left+'px;  "><i class="fa fa-briefcase"></i><span>Choose Job</span></div>');

        $('.overlay').append('<div class="innercontent"><div class="container"><div class="row"><div class="col-sm-4 col-sm-offset-4 text-center"><p class="bold">Choose by Job to see if you\'d be better off working in a different country</p></div></div></div></div>');

        $('.overlay, .overlay .btn').click(function(){
            if(clicks == 0){

                $('.overlay').html('');
                $('.overlay').append('<div class="tmp-select-display" style="position:absolute; width: '+$('.mobile-nav li:first-child').outerWidth()+'px; top: '+$('.mobile-nav li:first-child').offset().top+'px; left: '+($('.mobile-nav li:first-child').offset().left + $('.mobile-nav li:first-child').outerWidth())+'px;  "><i class="fa fa-map-marker"></i><span>Choose Country</span></div>');
                $('.overlay').append('<div class="innercontent"><div class="container"><div class="row"><div class="col-sm-4 col-sm-offset-4 text-center"><p class="bold mb-50">Or choose by country to find what careers are thriving across Europe.</p><button class="btn btn-yellow">Got it!</button></div></div></div></div>');
            } else {
                $('.overlay').removeClass('show');
            }
            clicks++;
        });

        $('#welcome').addClass('slideUp');

    } else {

        $('.search-drop-form  .bootstrap-select.choose-by-job').clone().appendTo('.overlay').css({"width": $('.search-drop-form .choose-by-job').width(), "position:": "absolute", "top": $('.search-drop-form .choose-by-job').offset().top, "left": $('.search-drop-form .choose-by-job').offset().left });

        $('.overlay').append('<div class="innercontent"><div class="container"><div class="row"><div class="col-sm-4 col-sm-offset-4 text-center"><p class="bold">Choose by Job to see if you\'d be better off working in a different country</p></div></div></div></div>');

        $('.overlay, .overlay .btn').click(function(){
            if(clicks == 0){
                $('.overlay').html('');
                $('.search-drop-form  .bootstrap-select.choose-by-country').clone().appendTo('.overlay').css({"width": $('.search-drop-form .choose-by-country').width(), "position:": "absolute", "top": $('.search-drop-form .choose-by-country').offset().top, "left": $('.search-drop-form .choose-by-country').offset().left });
                $('.overlay').append('<div class="innercontent"><div class="container"><div class="row"><div class="col-sm-4 col-sm-offset-4 text-center"><p class="bold mb-50">Or choose by country to find what careers are thriving across Europe.</p><button class="btn btn-yellow">Got it!</button></div></div></div></div>');
            } else {
                $('.overlay').removeClass('show');
            }
            clicks++;
        });

        $('#welcome').addClass('slideUp');

    }

    return false;
}

function applyFilters(){
    $('.mobile-nav li:last-child a').removeClass('active');
    $('.mobile-pane').removeClass('active');
    return false;
}

$(window).resize(function(){
    checkMobile();
});
