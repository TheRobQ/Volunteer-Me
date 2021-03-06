$(document).ready(function() {
  $("#newExperience").submit(function(event) {
    event.preventDefault();

    const title = $("input#what").val();
    const description = $("#description").val();
    const org = $("select#org").val();
    const role = $("input#role").val();
    const hours = $("input#setHours").val();
    const minutes = $("input#minutes").val();
    const date = $("input#date").val();
    const user_id = localStorage.getItem("user");
    const group_id = localStorage.getItem("group");
    const towardGoal = (hours, minutes) =>{
    return (parseInt(hours) * 60) + parseInt(minutes)
    }
    if(hours === '0' && minutes === '0'){
      $('.alert').removeClass('hidden')
    }
    else{
    $.post("/experiences/", {
        title: title,
        user_id: user_id,
        description: description,
        org: org,
        role: role,
        hours: hours,
        minutes: minutes,
        date: date,
        towardGoal: towardGoal(hours, minutes)
      })

    $.ajax({
      url: `/groups/${group_id}`,
      method: 'PATCH',
      data: {
        towardGoal: parseInt(hours)
      },
      success: function(response) {
        window.location.href = '/landing.html'
      },
      error: function(response) {
        console.log(response);
      }
    })
  }
  })
})
