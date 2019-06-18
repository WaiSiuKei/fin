import '@fin/note/input.css';
import { Input } from '../../../widgets/note/src/input/input';

function start() {
  let input = new Input();
  document.querySelector('#container').appendChild(input.node);
}

start();
