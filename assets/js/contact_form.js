/*=============Script handling Contact Form=====================*/
const scriptURL = 'https://script.google.com/macros/s/AKfycbyYPe5WzAZ879_-sRpZ5_UOib9AexBvI2IhDLEoxR-tJCli-eiACIhX5xyeMQ8Q4KOX/exec'
const form = document.forms['submit-to-google-sheet']
const msg = document.getElementById("msg")

form.addEventListener('submit', e => {
    e.preventDefault()
    fetch(scriptURL, { method: 'POST', body: new FormData(form)})
    .then(response => {
        msg.innerHTML = "Message Sent successfully"
        setTimeout(function(){
        msg.innerHTML = ""
        }, 5000)
        form.reset()
    })
    .catch(error => console.error('Error!', error.message))
})