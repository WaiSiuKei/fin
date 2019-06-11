import '@fin/mindmap/mindmap.css';
import { Topic, Mindmap } from '@fin/mindmap';

let map = new Mindmap(document.getElementById('container'));
let topic = new Topic();
map.addTopic(topic);

let subTopic = new Topic();
let subTopic2 = new Topic();
let subTopic3 = new Topic();
map.addTopic(subTopic, topic);
map.addTopic(subTopic2, topic);
map.addTopic(subTopic3, topic);
