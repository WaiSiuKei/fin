import '@fin/note/input.css';
import { InputWidget } from '../../../widgets/note/src/input/inputWidget';
import { TextModel } from '../../../widgets/note/src/input/model/textModel';

function start() {
  let input = new InputWidget(document.querySelector('#container'));
  let model = new TextModel('');
  input.setModel(model);
  input.focus()
  console.log(model)
}

start();
