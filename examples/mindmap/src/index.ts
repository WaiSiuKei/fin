import '@fin/mindmap/mindmap.css';
import { Mindmap } from '../../../widgets/mindmap/src/mindmap';
import { Topic } from '../../../widgets/mindmap/src/core/topic';

function start() {
  let map = new Mindmap(document.getElementById('container'));
  let topic = new Topic();
  map.addTopic(topic);

  let subTopic1 = new Topic();
  let subTopic2 = new Topic();
  let subTopic3 = new Topic();
  map.addTopic(subTopic1, topic);
  map.addTopic(subTopic2, topic);
  map.addTopic(subTopic3, topic);

  let topic11 = new Topic();
  map.addTopic(topic11, subTopic1);
  map.addTopic(new Topic(), subTopic1);
  map.addTopic(new Topic(), subTopic1);

  map.addTopic(new Topic(), subTopic2);

  map.addTopic(new Topic(), topic11);
  map.addTopic(new Topic(), topic11);
}

setTimeout(start, 2000);
