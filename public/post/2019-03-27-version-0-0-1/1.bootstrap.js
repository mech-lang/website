(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[1],{

/***/ "./editor.js":
/*!*******************!*\
  !*** ./editor.js ***!
  \*******************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var mech_wasm__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mech-wasm */ \"./node_modules/mech-wasm/mech_wasm.js\");\n\r\n\r\nlet mech_core = mech_wasm__WEBPACK_IMPORTED_MODULE_0__[\"Core\"].new();\r\n\r\nlet time = 1;\r\n\r\n// ## Controls\r\n\r\nlet controls = document.createElement(\"div\");\r\ncontrols.setAttribute(\"class\", \"controls\");\r\n\r\nlet compile = document.createElement(\"button\");\r\ncompile.setAttribute(\"id\", \"compile\");\r\ncompile.innerHTML =  \"Compile\";\r\ncontrols.appendChild(compile);\r\n\r\nlet view_core = document.createElement(\"button\");\r\nview_core.setAttribute(\"id\", \"view core\");\r\nview_core.innerHTML =  \"View Core\";\r\ncontrols.appendChild(view_core);\r\n\r\nlet view_runtime = document.createElement(\"button\");\r\nview_runtime.setAttribute(\"id\", \"view runtime\");\r\nview_runtime.innerHTML =  \"View Runtime\";\r\ncontrols.appendChild(view_runtime);\r\n\r\nlet clear_core = document.createElement(\"button\");\r\nclear_core.setAttribute(\"id\", \"clear core\");\r\nclear_core.innerHTML =  \"Clear Core\";\r\ncontrols.appendChild(clear_core);\r\n\r\nlet txn = document.createElement(\"button\");\r\ntxn.setAttribute(\"id\", \"txn\");\r\ntxn.innerHTML =  \"Add Txn\";\r\n\r\n// ## Time Travel\r\n\r\nfunction resume() {\r\n  let toggle_core = document.getElementById(\"toggle core\");\r\n  let time_slider = document.getElementById(\"time slider\");\r\n  mech_core.resume();\r\n  toggle_core.innerHTML = \"Pause\";\r\n  time_slider.value = time_slider.max;\r\n  render();\r\n}\r\n\r\nfunction pause() {\r\n  let toggle_core = document.getElementById(\"toggle core\");\r\n  mech_core.pause();\r\n  toggle_core.innerHTML = \"Resume\";\r\n  render();\r\n}\r\n\r\nlet time_travel = document.createElement(\"div\");\r\ntime_travel.setAttribute(\"class\", \"time-travel\");\r\n\r\nlet time_slider = document.createElement(\"input\");\r\ntime_slider.setAttribute(\"id\", \"time slider\");\r\ntime_slider.setAttribute(\"class\", \"slider\");\r\ntime_slider.setAttribute(\"min\", \"1\");\r\ntime_slider.setAttribute(\"max\", \"100\");\r\ntime_slider.setAttribute(\"value\", \"100\");\r\ntime_slider.setAttribute(\"type\", \"range\");\r\ntime_travel.appendChild(time_slider);\r\n\r\nlet last_slider_value = 100;\r\ntime_slider.oninput = function() {\r\n  pause();\r\n  let current_value = this.value;\r\n  // Time travel forward\r\n  if (current_value > last_slider_value) {\r\n    mech_core.step_forward_one();\r\n  // Time travel backward\r\n  } else if (current_value < last_slider_value) {\r\n    mech_core.step_back_one();\r\n  }\r\n  last_slider_value = current_value;\r\n  render();\r\n}\r\n\r\nlet step_back = document.createElement(\"button\");\r\nstep_back.setAttribute(\"id\", \"step back\");\r\nstep_back.innerHTML =  \"<\";\r\nstep_back.onclick = function() {\r\n  pause();\r\n  mech_core.step_back_one();\r\n  time_slider.value = time_slider.value - 1;\r\n  render();\r\n}\r\ntime_travel.appendChild(step_back);\r\n\r\nlet toggle_core = document.createElement(\"button\");\r\ntoggle_core.setAttribute(\"id\", \"toggle core\");\r\ntoggle_core.innerHTML =  \"Pause\";\r\ntoggle_core.onclick = function() {\r\n  let toggle_core = document.getElementById(\"toggle core\");\r\n  let state = toggle_core.innerHTML;\r\n  if (state == \"Resume\") {\r\n    resume();\r\n  } else {\r\n    pause();\r\n  }\r\n  render();\r\n};\r\ntime_travel.appendChild(toggle_core);\r\n\r\nlet step_forward = document.createElement(\"button\");\r\nstep_forward.setAttribute(\"id\", \"step forward\");\r\nstep_forward.innerHTML =  \">\";\r\nstep_forward.onclick = function() {\r\n  pause();\r\n  mech_core.step_forward_one();\r\n  time_slider.value = time_slider.value*1 + 1;\r\n  render();\r\n}\r\ntime_travel.appendChild(step_forward);\r\n\r\n// ## Editor\r\n\r\nlet editor = document.createElement(\"div\");\r\neditor.setAttribute(\"class\", \"editor\");\r\n\r\nlet code = document.createElement(\"textarea\");\r\ncode.setAttribute(\"class\", \"code\");\r\ncode.setAttribute(\"id\", \"code\");\r\ncode.setAttribute(\"spellcheck\", \"false\");\r\n\r\nlet drawing_area = document.createElement(\"div\")\r\ndrawing_area.setAttribute(\"id\", \"drawing\");\r\ndrawing_area.setAttribute(\"class\", \"drawing-area\");\r\n\r\neditor.appendChild(drawing_area)\r\n\r\n// ## Editor Container\r\n\r\nlet editor_container = document.createElement(\"div\");\r\neditor_container.setAttribute(\"id\",\"editor container\");\r\neditor_container.setAttribute(\"class\",\"editor-container\");\r\n\r\neditor_container.appendChild(controls);\r\neditor_container.appendChild(editor);\r\neditor_container.appendChild(time_travel);\r\n\r\n// ## Navigation\r\n\r\nlet nav = document.createElement(\"div\");\r\nnav.setAttribute(\"id\",\"navigation\");\r\nnav.setAttribute(\"class\",\"navigation\");\r\n\r\n\r\n// ## Bring it all together\r\n\r\n//document.body.appendChild(app);\r\n\r\nfunction render() {\r\n  mech_core.render();\r\n}\r\n\r\n\r\n// MECH CODE\r\n\r\nlet robot_arm_program = `# Robot Arm Drawing\r\n\r\nThis is where the main website structure is defined\r\n  #app/main = [|root         direction containts|\r\n                \"robot-arm\" \"column\"  [#robot-controls]\r\n                \"robot-arm\"    \"column\"  [#robot-animation]]\r\n                \r\n## Drawing\r\n\r\nSet up the robot arm linkages\r\n  angle1 = #slider1{1,4}{1,3}\r\n  angle2 = #slider2{1,4}{1,3}\r\n  angle3 = #slider3{1,4}{1,3}\r\n  x0 = 375\r\n  y0 = 350\r\n  h1 = 53\r\n  h2 = 100\r\n  h3 = 85\r\n  y1 = (y0 - 50) - h1 * math/cos(degrees: angle1)\r\n  x1 = x0 + h1 * math/sin(degrees: angle1)\r\n  y2 = y1 - h1 * math/cos(degrees: angle1)\r\n  x2 = x1 + h1 * math/sin(degrees: angle1)\r\n  y3 = y2 - h2 * math/cos(degrees: angle2)\r\n  x3 = x2 + h2 * math/sin(degrees: angle2)\r\n  y4 = y3 - h2 * math/cos(degrees: angle2)\r\n  x4 = x3 + h2 * math/sin(degrees: angle2)\r\n  y5 = y4 - h3 * math/cos(degrees: angle3)\r\n  x5 = x4 + h3 * math/sin(degrees: angle3)\r\n  #robot-arm = [|shape   parameters|\r\n                 \"image\" [x: x3 y: y3 rotation: angle2 image: \"https://mech-lang.org/img/robotarm/link2.png\"]\r\n                 \"image\" [x: x1 y: y1 rotation: angle1 image: \"https://mech-lang.org/img/robotarm/link1.png\"]\r\n                 \"image\" [x: x0 y: y0 rotation: 0 image: \"https://mech-lang.org/img/robotarm/link0.png\"]\r\n                 \"image\" [x: x5 y: y5 rotation: angle3 image: \"https://mech-lang.org/img/robotarm/gripper.png\"]]\r\n\r\nDo the draw \r\n  #drawing = [type: \"canvas\" class: _ contains: [#robot-arm] parameters: [width: 750 height: 450]]\r\n  \r\nAnimation controls  \r\n  #slider1 = [type: \"slider\" class: _ contains: _ parameters: [min: -120 max: 120 value: -45]]\r\n  #slider2 = [type: \"slider\" class: _ contains: _ parameters: [min: -120 max: 120 value: 60]]\r\n  #slider3 = [type: \"slider\" class: _ contains: _ parameters: [min: -90 max: 200 value: 170]]\r\n\r\nCompose animation and controls\r\n  #robot-controls = [type: \"div\" class: _ containts: [#slider1; #slider2; #slider3]]\r\n  #robot-animation = [type: \"div\" class: _ contains: [#drawing]]`\r\n\r\n\r\n\r\n  mech_core.compile_code(robot_arm_program);\r\n  mech_core.add_application();\n\n//# sourceURL=webpack:///./editor.js?");

/***/ })

}]);