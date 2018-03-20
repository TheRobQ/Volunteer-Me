
$(document).ready(function() {
  var goal = 0;
  var towardGoal = 0;
  const userId = localStorage.getItem("user");
  var experiences;
  var userData;
  var groupData;
  var remaining = 0;
  var orgs =[];
  var modeObject = {};
  var timeData = [];

  $('body').ready(function(event) {
    $.ajax({
      url: `/users/${userId}/experiences`,
      method: 'GET',
      success: function(response) {
        experiences = response
      },
      error: function(response) {
        console.log(response);
      }
    }).done(function(experiences){
      for (let i = 0; i < experiences.length; i++) {
        $.ajax({
          url: `/orgs/${experiences[i].org_id}`,
          type: 'GET',
          success: function(thedata){
            orgs.push(thedata[0])
          },
          error: function(response){
            console.log(response)
          }
        })
      }
    })

  $.get(`/users/${userId}`, function(response) {
    userData = response
    })
    .then(function(response) {
      $.get(`groups/${userData[0].group_id}`, data => {
      groupData = data[0];
        })
      })

  //Get most frequent cause
  const getMode = array => {
    var maxCount = 1
    var mostFrequent;
    for (let i = 0; i < array.length; i++) {
      var cause = array[i].cause;
      if (!modeObject[cause]) {
        modeObject[cause] = 1;
      }else{
      modeObject[cause]++
    }
      if(modeObject[cause] > maxCount){
        maxCount = modeObject[cause]
        mostFrequent = array[i].cause
      }
    }
    return mostFrequent
  };

  const getCauseIcon = (fn) => {
      if(getMode(orgs) === 'Animals'){
        return "fas fa-paw"
        console.log(getMode(orgs));
      }
       if(getMode(orgs) === 'Community Building'){
        return "fas fa-handshake"
      }
       if(getMode(orgs) === 'Advocacy'){
        return "fas fa-bullhorn"
      }
      if(getMode(orgs) === 'Arts & Culture'){
       return "fas fa-paint-brush"
     }
     if(getMode(orgs) === 'Arts & Culture'){
      return "fas fa-paint-brush"
    }
        return  "fas fa-thumbs-up"
  }

  //Align orgs to correct experience
  const setOrg = (experiences, orgs) =>{
    for(let i = 0; i < experiences.length; i++){
      for(let j = 0; j < orgs.length; j++){
        if(experiences[i].org_id === orgs[j].id){
          experiences[i].org_id = orgs[j].name
        }
      }
    }
    return experiences
  }

  const getTotalHours = (array) => {
    var hours = 0
    var minutes = 0
    for(let i = 0; i < array.length; i++){
        hours += array[i].hours
        minutes += array[i].minutes
      }
      if(minutes > 60){
          hours += Math.floor(minutes / 60)
          minutes = minutes % 60
      }
      var myTime = `${hours} hours and ${minutes} minutes`
      return myTime
  }

  const getTIme =(experiences, i) =>{
    if(i === experiences.length){
      return
    }
    timeData.push(experiences[i])
    i++
    return getTIme(experiences, i)
  }


//after all reqs made AJAX COMPLETED
  $( document ).ajaxStop(function() {
    localStorage.setItem("group", groupData.id)
    var myTotal = getTotalHours(experiences)
    var passion = getMode(orgs)
    $.when(setOrg(experiences, orgs)).then(getTIme(experiences, i = 0))
    $.when(getMode(orgs)).then(getCauseIcon(getMode))
    console.log(timeData)
    console.log(userData);

    //Add the greeting to the page
    $('#welcome').append(`<h1 class="col-sm-12 greeting">Hello, ${userData[0].firstName} <span class="badge"><i class="${getCauseIcon(orgs)}"></i></span><span id="hours"> You've volunteered a total of  ${myTotal}!</span></h1>`)

    //Chart Goal
    $('#chart').append(`<h3 class="pieLabel">Your current goal is ${userData[0].goal /60} hours</h3>`)
    //Current passion
    $("#passion").append(`<h3><strong>Your current passion is: </strong>${passion}</h3>`)
    //Add experiences to the page
      $('#recent').append(`
        <h3 style="max-width: 38rem;">Your most recent volunteer experience</h3>
        <div class="card border-dark mb-3" style="max-width: 38rem;">
        <div class="card-header">On ${experiences[0].date}</div>
        <div class="card-body text-dark">
          <h5 class="card-title">${experiences[0].title} for ${experiences[0].org_id}</h5>
          <p class="card-text">${experiences[0].description}</p>
        </div>
      </div>`)
      $('#group').append(`<h3><strong>Your group: </strong> ${groupData.name}</h3>`)

      $("#groupInfo").append(`<h4 class="sideBoard">${groupData.name} goal: ${groupData.goal_hours}</h4>
        <h4 class="sideBoard"> ${groupData.name} current hours: ${groupData.current_hours} </h4>
        <h4 class="sideBoard">Your current contribution: ${Math.max(userData[0].towardGroup / 60)} hours<h4>`)

       //Add you total Time to the page
       // $("#main").append(`<h2>You've put in ${myTotal}!</h2> `)


      //D3 main circle
      const mainCircle = ()=> {
      let goal = userData[0].goal
      let towardGoal = userData[0].towardGoal
      let remaining = goal - towardGoal
      let  currentHours = Math.floor(towardGoal / 60)
      var dataset = [ { hours: towardGoal, display: currentHours},
        {  hours: remaining, display: 'none'} ]

      var pie = d3.layout.pie().value(function(d) {
        return d.hours
      }).sort(null).padAngle(.03)

      var w = 450
      var h = 450
      var outerRadius = w / 2.75
      var innerRadius = 223
      // var color = d3.scale.category10()
      var color = d3.scale.ordinal().domain([0, 1]).range(['#B0C4DE', '#F4A460'])
      var arc = d3.svg.arc().outerRadius(outerRadius).innerRadius(innerRadius)

      var svg = d3.select("#chart")
      .append("svg")
      .attr({width: w, height: h, class: 'shadow'})
      .append('g')
      .attr({
        transform: 'translate(' + w / 2 + ',' + h / 2 + ')'
      });

      var path = svg.selectAll('path')
      .data(pie(dataset))
      .enter()
      .append('path')
      .attr({
        d: arc,
        fill: function(d, i) {
          return color(i);
        }
      })
      .style("stroke", "black")

      path.transition().duration(1750).attrTween('d', function(d) {
        var interpolate = d3.interpolate({
          startAngle: 0,
          endAngle: 0
        }, d);
        return function(t) {
          return arc(interpolate(t));
        };
      });

      svg
      .append('svg:text')
      .attr('x', -84)
      .attr('y', 30)
      .attr('class', 'id')
      .append('svg:tspan')
      .attr('x', -70)
      .attr('dy', -15)
      .text(dataset[0].display)
      .style({fill: 'black', 'font-size': '114px', 'font-family': 'helvetica', 'font-weight': 'bold'})
      .append('text:tspan')
      .attr('x', -69)
      .attr('dy', 60)
      .text('hours')
      .style({fill: 'black', 'font-size': '60px', 'font-family': 'helvetica', 'font-weight': 200})
      }

      //PIE chart for group data
      const groupPie = () =>{
        var groupGoal = groupData.goal_hours
        var current_hours = groupData.current_hours
        let remaining = groupGoal - current_hours
        var w = 200
        var h = 200
        var r = 100

       var data = [ {label:"Group", value: current_hours},  {label: "Goal", value: remaining} ];
       var color = d3.scale.ordinal().domain([0, 1]).range(['#66CDAA', '#CD5C5C', '#FFB6C1'])

       var pie = d3.layout.pie()
           .value(function(d) { return d.value; }).sort(null)

       var holder = d3.select("#groupChart")
           .append("svg:svg")
           .data([data])
           .attr("width", w)
           .attr("height", h)
           .append("svg:g")
           .attr("transform", "translate(" + r + "," + r + ")")

       var arc = d3.svg.arc()
           .outerRadius(r);

       var arcs = holder.selectAll("g.slice")
           .data(pie)
           .enter()
           .append("svg:g")
           .attr("class", "slice") // slice claas for styles

      arcs.append("svg:path")
            .attr("fill", function(d, i) { return color(i); } )
            .attr("d", arc)
            .attr('stroke', '#fff')
            .attr('stroke-width', '3')
            .transition().duration(1600).attrTween('d', function(d) {
                 var interpolate = d3.interpolate({
                   startAngle: 0,
                   endAngle: 0
                 }, d);
                 return function(t) {
                   return arc(interpolate(t));
                 };
               });

      arcs.append("svg:text")
              .attr("transform", function(d) {
                  d.innerRadius = 0;
                 d.outerRadius = r;
                 return "translate(" + arc.centroid(d) + ")"
               })
              .attr("text-anchor", "middle")
              .text(function(d, i) { return data[i].label; })
      }

//Main chart of experiences
      const timeLine = () => {
      var responsiveW = d3.select("#mainChart").node().getBoundingClientRect()
        //console.log(responsiveW.width);
        var width = responsiveW.width
        var height = () => {
           if(timeData.length < 6){
          return 575}
          else{
            return timeData.length *75
          }
          }
        var padding = 110;
        var cValue = function(d) { return d.org_id}
        var color = d3.scale.ordinal().domain(timeData.map(function(d){return d.org_id})).range(['#B0C4DE', '#F4A460', '#A52A2A', '#6495ED', '#8B0000'	])

        var tooltip = d3.select("#mainChart").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    //created SVG container here
    var chart1 = d3.select('#mainChart')
      	.append('svg:svg')
      	.attr('width', width)
      	.attr('height', height())
      	.attr('class', 'chart1')

    var y = d3.scale.ordinal()
        .domain(timeData.map(function(d){return d.date}))
        .rangePoints([height()-(padding+25), padding])

    var x = d3.scale.ordinal()
    	      .domain(timeData.map(function(d){return d.org_id}))
    	      .rangePoints([padding, width-(padding+200) ])

    var main = chart1.append('g')
  	.attr('transform', 'translate(' + 6 + ',' + 2 + ')')
  	.attr('width', width-padding)
  	.attr('height', height()-padding)
  	.attr('class', 'main')

    // draw the x axis
    var xAxis = d3.svg.axis()
      	.scale(x)
      	.orient('bottom')
    main.append('g')
      	.attr('transform', 'translate(30,' + (height() - padding +22) + ')')
      	.attr('class', 'main axis org')
        .style('fill', 'red')
      	.call(customXAxis);

    // draw the y axis
    var yAxis = d3.svg.axis()
	       .scale(y)
	       .orient('left');
    main.append('g')
      	.attr('transform', 'translate('+padding+',0)')
      	.attr('class', 'main axis date')
      	.call(customYAxis);

    var g = main.append("svg:g");

    g.selectAll("scatter-dots")
      .data(timeData)
      .enter().append("svg:circle")
          .attr("cx", function (d) { return x(d.org_id) +33 } )
          .attr("cy", function (d) { return y(d.date) -9 } )
          .attr("r", 22)
          .style("fill", function(d) { return color(cValue(d));})
          .style("stroke", "black")
          .on("mouseover", function(d){
            d3.select(this).transition()
                 .duration(500).attr("r", 34)
          })
          .on("click", function(d) {
              tooltip.transition()
                   .duration(400)
                   .style("opacity", .9);
              tooltip.html(`<div class="card">
  <div class="card-body">
    <h5 class="card-title chart-title">${d.title}</h5>
    <h6 class="card-subtitle mb-2 text-muted"><strong>Role: </strong>${d.role}</h6>
    <p class="card-text"><strong>What I did: </strong>${d.description}</p>
    <h6 class="card-subtitle mb-2 text-muted">${d.hours} hours and ${d.minutes} minutes</h6>
  </div>
</div>`)
				            .style("left", d3.select(this).attr("cx") + "px")
				             .style("top", d3.select(this).attr("cy") + "px")
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(400)
               .style("opacity", 0)
               d3.select(this).transition()
                    .duration(500).attr("r", 22)
      });

      function customYAxis(g) {
        g.call(yAxis);
        g.select(".domain").remove();
        g.selectAll(".tick text").attr("x", -12).attr("dy", -1)
        .attr('font-family', 'helvetica')
        .attr('font-size', '20px')
      }

      function customXAxis(g) {
        g.call(xAxis)
        g.selectAll(".tick text").attr("x", 9).attr("y", 27)
        .attr('fill', 'black')
        .attr('font-family', 'helvetica')
        .attr('font-size', '15px')
        // g.select(".domain").remove()
        }
      var legend = main.selectAll(".legend")
          .data(color.domain())
          .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate(-89," + (i +1) * 33 + ")"; });

          legend.append("rect")
            .attr("x", width - 20)
            .attr("width", 21)
            .attr("height", 21)
            .style("fill", color)
            .style("stroke", "black")

  // draw legend text
        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) { return d;})
      }

      timeLine()
      mainCircle()
      groupPie()
    })
  })

  $("#setGoal").submit(function(event) {
      const value = $("input#addGoal").val();
      const goal = parseInt(value) * 60
      // console.log('clicked');
      $.ajax({
        url: `/users/${userId}/`,
        type: 'PATCH',
        global: false,
        data: {
          goal: goal
        },
        success: function(data) {
          // console.log(data);
        },
        error: function(response) {
          console.log(response);
        }
      })
  })
})

// if (currentMinutes > 60) {
//   currentHours += Math.floor(currentMinutes / 60)
//   currentMinutes = currentMinutes % 60
// }
