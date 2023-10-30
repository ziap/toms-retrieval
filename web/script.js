const config = JSON.parse(config_json.textContent)
const fps_map = new Map(Object.entries(JSON.parse(fps_json.textContent)))

search_form.addEventListener("submit", async e => {
  e.preventDefault()

  const data = new FormData(e.target)
  document.title = "⏳ Loading"
  const response = await fetch("/search", {
    method: "POST",
    body: data.get("query")
  })

  result_container.innerHTML = await response.text()
  document.title = "AIC video browser"
})

clear_form.addEventListener("submit", e => {
  e.preventDefault()

  const data = new FormData(e.target)
  const video_id = data.get("video")
  if (video_id == "") {
    for (const e of document.querySelectorAll(".result-item")) {
      e.classList.remove("hidden")
    }
    return
  }

  for (const e of document.querySelectorAll(`[data-video-id=${video_id}]`)) {
    e.classList.toggle("hidden")
  }
})

login_button.addEventListener("click", async () => {
  submit_log.textContent = "logging in..."

  const res = (await (await fetch(`${config.api_url}/login`, {
    method: "POST",
    body: JSON.stringify({
      username: config.username,
      password: config.password
    })
  })).json())

  submit_log.innerHTML = JSON.stringify(res, null, 2)
  session_field.value = res.sessionId
})

submit_form.addEventListener("submit", async e => {
  e.preventDefault()
  submit_log.textContent = "submitting..."
  const data = new FormData(e.target)
  const video = data.get("video")
  const frame = data.get("frame")
  const session = data.get("session")
  const url = `${config.api_url}/v1/submit?item=${video}&frame=${frame}&session=${session}`
  const result = await (await fetch(url)).json()
  submit_log.innerHTML = JSON.stringify(result, null, 2)
})

frame_input.addEventListener("change", () => {
  const pattern = /^[0-5]?\d:[0-5]\d$/
  if (!pattern.test(frame_input.value) || !fps_map.has(video_input.value)) return

  const splitted = frame_input.value.split(":")
  const timestamp = Number(splitted[0]) * 60 + Number(splitted[1])
  frame_input.value = Math.floor(timestamp * fps_map.get(video_input.value))
})

video_input.addEventListener("change", () => {
  const pattern = /^L\d\d_V\d\d\d:\d+$/
  if (!pattern.test(video_input.value)) return

  const splitted = video_input.value.split(":")
  video_input.value = splitted[0]
  frame_input.value = splitted[1]
})
