import axios from 'axios';
import retryAdapter from './lib';

axios.defaults.adapter = retryAdapter;

var $ = (selector, context = document.body) => {
  return context.querySelector(selector);
};

var $btn = $("#btn");
var $res = $("#res");

$btn.addEventListener("click", () => {
  axios.get("/echo/hello world").then(({ data }) => {
    $res.textContent = JSON.stringify(data)
  })
});
