var job_array = [];
var country_array;
var currency_symbol = "£";
var exchange_rate = 1;
var desired_table = null;
var specific_job_table = [];
var specific_country_table = [];
var poundButton = $(".pound");
var dollarButton = $(".dollar");
var euroButton = $(".euro");
var uk = true;
var isMobile = false;

$(function() {
  // Check to see if the user is in the UK
  // checkCurrancy();

  // Load jobs from the JSON file
  $.getJSON("./js/jobs.json", function(data) {
    // Append the TITLE options
    $(".choose-by-job").append(
      '<option data-icon="fa fa-briefcase" value="none">Select Job</option>'
    );

    $.each(data, function(i, v) {
      // Push each job obbject into the job array
      job_array.push(v);
      $(".choose-by-job").append(
        '<option value="' +
          i +
          '" data-icon="fa fa-briefcase">' +
          v.job +
          "</option>"
      );
    });
  });

  // Load Counties from the JSON File
  $.getJSON("./js/countries.json", function(data) {
    // Add ALL the county objects into the array
    country_array = data;

    $(".choose-by-country").append(
      '<option data-icon="fa fa-map-marker" value="none">Pick Country</option>'
    );

    $.each(data, function(i, v) {
      $(".choose-by-country").append(
        '<option data-icon="fa fa-map-marker" value="' +
          i +
          '">' +
          v.name +
          "</option>"
      );
    });

    // After .5 seconds, call selectpicker (this will be enough time to wait for JSON to finish)
    setTimeout(function() {
      $(".choose-by-job").selectpicker();
      $(".choose-by-country").selectpicker();
      $(".filteroptions").selectpicker();
      showTable("#countryTable", country_array);
    }, 500);
  });

  // Mobile Navigation (Bottom Tabs)
  $(".mobile-nav a").click(function(e) {
    e.preventDefault();

    if ($(this).hasClass("active")) {
      // Hide Pane
      $(
        "#" +
          $(this)
            .attr("href")
            .substring(1)
      ).removeClass("active");
      $(this).removeClass("active");
    } else {
      $(".mobile-pane").removeClass("active");
      $(".mobile-nav a").removeClass("active");

      $(this).addClass("active");
      $(
        "#" +
          $(this)
            .attr("href")
            .substring(1)
      ).addClass("active");
    }
  });

  $("#at4-thankyou").hide();
  $("#at-cv-lightbox").hide();
  // If mobile or small screen
  if ($(window).width() < 991) {
    $("#at4-share").hide();
    $(".at-share-dock-outer").hide();

    // Append the selectpicker options to the mobile select
    $(".mobile-nav .choose-by-job").on("show.bs.select", function(e) {
      $(".mobile-nav li:last-child a").removeClass("active");
      $(".mobile-pane").removeClass("active");
    });

    $(".mobile-nav .choose-by-country").on("show.bs.select", function(e) {
      $(".mobile-nav li:last-child a").removeClass("active");
      $(".mobile-pane").removeClass("active");
    });
  }

  $(".toggleFacts").click(function(e) {
    e.preventDefault();
    if ($(".facts-con").hasClass("show")) {
      $(".facts-con").removeClass("show");
      $(".content").css("top", 42 + $("#header").outerHeight() + "px");
    } else {
      $(".facts-con").addClass("show");
      $("#search .content").css("top", 192 + $("#header").outerHeight() + "px");
    }
  });

  // Social Bar
  setTimeout(function() {
    $("#at4-share").css("top", "0");
    $("#at4-share").append('<a class="embed">Embed</a>');
    $("#at-share-dock").append('<a class="embed">Embed</a>');
  }, 500);

  $(document).on("click", ".embed", function(e) {
    e.preventDefault();
    $("#embedModal").modal("show");
  });
});

var currencyButtons = { poundButton, dollarButton, euroButton };

function changeCurrency(rate, symbol, currency_name) {
  currency_symbol = symbol;
  exchange_rate = rate;

  // cancel all button active
  for (var currency in currencyButtons) {
    currencyButtons[currency].removeClass("active");
  }

  // set active
  currencyButtons[currency_name + "Button"].addClass("active");

  // re-render table
  if (!desired_table) {
    showTable("#countryTable", country_array);
  }

  if (desired_table === "job") {
    console.log("GET specific_country_table", specific_country_table);
    showTable("#jobsTable", specific_country_table);
  }

  if (desired_table === "country") {
    console.log("GET specific_job_table", specific_job_table);
    showTable("#countryTable", specific_job_table);
  }
}

// Pick job function (Called onChange on Select)
function pickJob() {
  desired_table = "country";

  if (isMobile) {
    $(".sub-section").removeClass("open");
    $(".sub-section").hide();
    $("#search .content").css("top", $("#header").outerHeight() + "px");
  } else {
    $(".countryInfoMsg").show();
  }

  // Set the Country Select to Title options (Resetting it)
  $(".choose-by-country").val("none");
  $(".choose-by-country").selectpicker("render");
  $(".choose-by-country").removeClass("activeselect");

  if ($(".choose-by-job option:selected").val() == "none") {
    $(".choose-by-job").removeClass("activeselect");
  } else {
    $(".choose-by-job").addClass("activeselect");
  }

  // Get job object based on the users selected value
  var job = job_array[$(".choose-by-job option:selected").val()].job;

  // var specific_job_array = [];

  var specific_job_array = job_array
    .find(function(el) {
      return el.job === job;
    })
    .countries.map(function(el) {
      return {
        name: el.country,
        average_income: el.salary
      };
    })
    .map(function(el) {
      var countryObj = country_array.find(function(x) {
        return x.name.toLowerCase() === el.name.toLowerCase();
      });

      return Object.assign(countryObj, el);
    });

  $("[data-country-facts]").removeClass("show");

  $(".sub-section").addClass("open");

  setTimeout(function() {
    checkMobile();
  }, 200);

  specific_job_table = specific_job_array;
  console.log("SET specific_job_table", specific_job_table);

  // Show table based on data
  showTable("#countryTable", specific_job_array);
}

function pickCountry() {
  desired_table = "job";

  // Choose a job select reset
  $(".choose-by-job").val("none");
  $(".choose-by-job").selectpicker("render");
  $(".choose-by-job").removeClass("activeselect");

  if ($(".choose-by-country option:selected") == "none") {
    // remove yellow
    $(".choose-by-country").removeClass("activeselect");
  } else {
    $(".choose-by-country").addClass("activeselect");
  }

  if (!isMobile) {
    $(".countryInfoMsg").hide();
  }

  var country =
    country_array[$(".choose-by-country option:selected").val()].name;
  // Get the name of the country from the index
  // Filter each job for the specific country name

  var specific_country_array = [];

  $.each(job_array, function(i, v) {
    var obj = {};
    obj.name = v.job;
    $.each(v.countries, function(ii, vv) {
      if (vv.country == country) {
        obj.country = vv.country;
        obj.salary = vv.salary;
        // obj.score = vv.score;
      }
    });
    specific_country_array.push(obj);
  });

  $("[data-advanced-filters]").removeClass("show");

  // Add the country data
  $("[data-weekly-hours-fact]").html(
    country_array[$(".choose-by-country option:selected").val()]
      .actual_weekly_hours_worked
  );
  $("[data-annual-paid-leave]").html(
    country_array[$(".choose-by-country option:selected").val()]
      .average_paid_leave
  );
  $("[data-living-index]").html(
    country_array[$(".choose-by-country option:selected").val()]
      .average_cost_of_living_index
  );

  $("[data-country-facts]").addClass("show");

  $(".sub-section").addClass("open");

  if (isMobile) {
    $(".sub-section").show();
    $("#search .content").css("top", 192 + $("#header").outerHeight() + "px");
  }

  setTimeout(function() {
    checkMobile();
  }, 200);

  specific_country_table = specific_country_array;
  console.log("SET specific_country_table", specific_country_table);

  showTable("#jobsTable", specific_country_array);
}

function showTable(table, array) {
  console.log({ desired_table, array });

  if ($.fn.DataTable.isDataTable("#countryTable")) {
    $("#countryTable")
      .DataTable()
      .destroy();
  }

  if ($.fn.DataTable.isDataTable("#jobsTable")) {
    $("#jobsTable")
      .DataTable()
      .destroy();
  }

  if (isMobile) {
    // Scroll content back to top, left
    $(".content").scrollTop(0);
    $(".content").scrollLeft(0);
  }

  $("#countryTable").hide();
  $("#jobsTable").hide();

  $("#jobsTable tbody").empty();
  $("#countryTable tbody").empty();

  $("#jobsTable tbody").html("");
  $("#countryTable tbody").html("");

  if (table == "#countryTable") {
    $.each(array, function(i, v) {
      $(" " + table + " tbody ").append(
        '<tr class=" ' +
          (v.name == "United Kingdom" && uk ? "selected" : "") +
          ' " >' +
          "<td>1</td>" +
          '<td><img class="flag" src="./img/icons/' +
          v.icon +
          '"> ' +
          v.name +
          "</td>" +
          "<td>" +
          currency_symbol +
          numeral(v.average_income * exchange_rate).format("0,0") +
          "</td>" +
          "<td>" +
          v.actual_weekly_hours_worked +
          "</td>" +
          "<td>" +
          v.average_paid_leave +
          "</td>" +
          "<td>" +
          v.average_cost_of_living_index +
          "</td>" +
          "</tr>"
      );
    });
  } else {
    $.each(array, function(i, v) {
      $(" " + table + " tbody ").append(
        "<tr>" +
          "<td>1</td>" +
          '<td><img class="flag" src="https://s3-eu-west-1.amazonaws.com/totallymoney/content/jobseurope/img/icons/' +
          v.name
            .replace(/\s+/g, "-")
            .replace(/\//g, "")
            .toLowerCase() +
          '.svg"> ' +
          v.name +
          "</td>" +
          "<td>" +
          currency_symbol +
          numeral(v.salary * exchange_rate).format("0,0") +
          "</td>" +
          "</tr>"
      );
    });
  }

  $(" " + table + " ").show();

  if (table == "#countryTable") {
    var rank = 0;
    $(" " + table + " ").DataTable({
      paging: false,
      bLengthChange: false,
      bInfo: false,
      order: [5, "desc"],
      initComplete: function() {
        var rank = 1;
        var tab = this;
        $("#countryTable tbody tr").each(function() {
          $(this)
            .find("td")
            .first()
            .text(rank);
          rank++;
          tab
            .api()
            .row($(this))
            .invalidate()
            .draw();
        });
      }
    });
  } else {
    $(" " + table + " ").DataTable({
      paging: false,
      searching: false,
      bLengthChange: false,
      bInfo: false,
      order: [2, "desc"],
      initComplete: function() {
        var rank = 1;
        var tab = this;
        $("#jobsTable tbody tr").each(function() {
          $(this)
            .find("td")
            .first()
            .text(rank);
          rank++;
          tab
            .api()
            .row($(this))
            .invalidate()
            .draw();
        });
      }
    });
  }

  checkMobile();
}

function checkMobile() {
  if (
    $(".content").outerHeight() +
      $(".sub-section").outerHeight() +
      $("#header").outerHeight() +
      $("#footer").outerHeight() <
    $(window).height()
  ) {
    $("#footer").addClass("sticky");
  } else {
    $("#footer").removeClass("sticky");
  }

  if ($(window).width() < 991) {
    isMobile = true;
    $(".search-drop-form .choose-by-job").remove();
    $(".search-drop-form .choose-by-country").remove();
  } else {
    isMobile = false;
  }
}

function resetTable() {
  desired_table = null;

  if (
    $(".choose-by-country option:selected").val() == "none" &&
    $(".choose-by-job option:selected").val() == "none"
  ) {
    showTable("#countryTable", country_array);
  } else if ($(".choose-by-country option:selected").val() != "none") {
    pickCountry($(".choose-by-country option:selected"));
  } else {
    // Reset advanced-filters
    pickJob($(".choose-by-job"));
  }

  return false;
}

function discover() {
  // Add Overlay
  $(".overlay").addClass("show");

  var clicks = 0;

  if (isMobile) {
    $(".overlay").append(
      '<div class="tmp-select-display" style="position:absolute; width: ' +
        $(".mobile-nav li:first-child").outerWidth() +
        "px; top: " +
        $(".mobile-nav li:first-child").offset().top +
        "px; left: " +
        $(".mobile-nav li:first-child").offset().left +
        'px;  "><i class="fa fa-briefcase"></i><span>Choose Job</span></div>'
    );

    $(".overlay").append(
      '<div class="innercontent"><div class="container"><div class="row"><div class="col-sm-4 col-sm-offset-4 text-center"><p class="bold">Select a job to see where you can earn the highest salary.</p><button class="btn btn-yellow">Next</button></div></div></div></div>'
    );

    $(document).on("click", ".overlay .btn", function() {
      if (clicks == 0) {
        $(".overlay").html("");
        $(".overlay").append(
          '<div class="tmp-select-display" style="position:absolute; width: ' +
            $(".mobile-nav li:first-child").outerWidth() +
            "px; top: " +
            $(".mobile-nav li:first-child").offset().top +
            "px; left: " +
            ($(".mobile-nav li:first-child").offset().left +
              $(".mobile-nav li:first-child").outerWidth()) +
            'px;  "><i class="fa fa-map-marker"></i><span>Choose Country</span></div>'
        );
        $(".overlay").append(
          '<div class="innercontent"><div class="container"><div class="row"><div class="col-sm-4 col-sm-offset-4 text-center"><p class="bold mb-50">Pick a country and discover its top-paying jobs.</p><button class="btn btn-yellow">Next</button></div></div></div></div>'
        );
      } else if (clicks == 1) {
        $(".overlay").html("");

        $(".table-head")
          .clone()
          .appendTo(".overlay");
        $(".overlay .table-head").append($("#countryTable").clone());
        $(".overlay .table-head").css({
          position: "absolute",
          left: 0,
          right: 0,
          top: 80 + "px",
          display: "block",
          height: "auto"
        });
        $(".overlay #countryTable").css({
          width: 1300 + "px",
          display: "block"
        });
        $(".overlay #countryTable tbody").remove();

        $(".overlay #countryTable thead").removeClass("data-notice");

        $(".overlay").append(
          '<div class="innercontent"><div class="container"><div class="row"><div class="col-sm-4 col-sm-offset-4 text-center"><p class="bold mb-50">Click the column headers to change how the table is sorted.</p><button class="btn btn-yellow">Next</button></div></div></div></div>'
        );
      } else if (clicks == 2) {
        $(".overlay")
          .find(".innercontent")
          .remove();
        $(".overlay").append(
          '<div class="innercontent"><div class="container"><div class="row"><div class="col-sm-4 col-sm-offset-4 text-center"><p class="bold mb-50">Scroll right to view more data</p><button class="btn btn-yellow">Got It</button></div></div></div></div>'
        );
      } else {
        $(".overlay").removeClass("show");
        $(".overlay").html("");
      }
      clicks++;
    });

    $("#welcome").addClass("slideUp");
  } else {
    $(".search-drop-form  .bootstrap-select.choose-by-job")
      .clone()
      .appendTo(".overlay")
      .css({
        width: $(".search-drop-form .choose-by-job").width(),
        "position:": "absolute",
        top: $(".search-drop-form .choose-by-job").offset().top,
        left: $(".search-drop-form .choose-by-job").offset().left
      });

    $(".overlay").append(
      '<div class="innercontent"><div class="container"><div class="row"><div class="col-sm-4 col-sm-offset-4 text-center"><p class="bold">Select a job to see where you can earn the highest salary.</p><button class="btn btn-yellow">Next</button></div></div></div></div>'
    );

    $(document).on("click", ".overlay .btn", function() {
      if (clicks == 0) {
        $(".overlay").html("");
        $(".search-drop-form  .bootstrap-select.choose-by-country")
          .clone()
          .appendTo(".overlay")
          .css({
            width: $(".search-drop-form .choose-by-country").width(),
            "position:": "absolute",
            top: $(".search-drop-form .choose-by-country").offset().top,
            left: $(".search-drop-form .choose-by-country").offset().left
          });
        $(".overlay").append(
          '<div class="innercontent"><div class="container"><div class="row"><div class="col-sm-4 col-sm-offset-4 text-center"><p class="bold mb-50">Pick a country and discover its top-paying jobs.</p><button class="btn btn-yellow">Next</button></div></div></div></div>'
        );
      } else if (clicks == 1) {
        $(".overlay").html("");

        $(".table-head")
          .clone()
          .appendTo(".overlay");
        $(".overlay .table-head").append($("#countryTable").clone());
        $(".overlay .table-head").css({
          position: "absolute",
          left: 0,
          right: 0,
          top: 108 + "px"
        });
        $(".overlay #countryTable").css({
          width: $(".container").css("width")
        });
        $(".overlay #countryTable tbody").remove();

        $(".overlay #countryTable thead").removeClass("data-notice");

        $(".overlay").append(
          '<div class="innercontent"><div class="container"><div class="row"><div class="col-sm-4 col-sm-offset-4 text-center"><p class="bold mb-50">Click the column headers to change how the table is sorted.</p><button class="btn btn-yellow">Got It</button></div></div></div></div>'
        );
      } else {
        $(".overlay").removeClass("show");
        $(".overlay").html("");
      }
      clicks++;
    });

    $("#welcome").addClass("slideUp");
  }

  return false;
}

function applyFilters() {
  $(".mobile-nav li:last-child a").removeClass("active");
  $(".mobile-pane").removeClass("active");
  return false;
}

function restartTool() {
  // Choose a job select reset
  $(".choose-by-job").val("none");
  $(".choose-by-job").selectpicker("render");
  $(".choose-by-job").removeClass("activeselect");

  // Set the Country Select to Title options (Resetting it)
  $(".choose-by-country").val("none");
  $(".choose-by-country").selectpicker("render");
  $(".choose-by-country").removeClass("activeselect");

  $("[data-country-facts]").removeClass("show");

  $(".sub-section").removeClass("open");

  if (isMobile) {
    $(".sub-section").removeClass("open");
    $(".sub-section").hide();
    $("#search .content").css("top", $("#header").outerHeight() + "px");
  }

  showTable("#countryTable", country_array);
  return false;
}

$(window).resize(function() {
  checkMobile();
});
