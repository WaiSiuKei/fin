import { FIN } from '@fin/iterator';
var Node = (function () {
    function Node(element) {
        this.element = element;
    }
    return Node;
}());
var LinkedList = (function () {
    function LinkedList() {
        this._size = 0;
    }
    Object.defineProperty(LinkedList.prototype, "size", {
        get: function () {
            return this._size;
        },
        enumerable: true,
        configurable: true
    });
    LinkedList.prototype.isEmpty = function () {
        return !this._first;
    };
    LinkedList.prototype.clear = function () {
        this._first = undefined;
        this._last = undefined;
        this._size = 0;
    };
    LinkedList.prototype.unshift = function (element) {
        return this._insert(element, false);
    };
    LinkedList.prototype.push = function (element) {
        return this._insert(element, true);
    };
    LinkedList.prototype._insert = function (element, atTheEnd) {
        var newNode = new Node(element);
        if (!this._first) {
            this._first = newNode;
            this._last = newNode;
        }
        else if (atTheEnd) {
            var oldLast = this._last;
            this._last = newNode;
            newNode.prev = oldLast;
            oldLast.next = newNode;
        }
        else {
            var oldFirst = this._first;
            this._first = newNode;
            newNode.next = oldFirst;
            oldFirst.prev = newNode;
        }
        this._size += 1;
        return this._remove.bind(this, newNode);
    };
    LinkedList.prototype.shift = function () {
        if (!this._first) {
            return undefined;
        }
        else {
            var res = this._first.element;
            this._remove(this._first);
            return res;
        }
    };
    LinkedList.prototype.pop = function () {
        if (!this._last) {
            return undefined;
        }
        else {
            var res = this._last.element;
            this._remove(this._last);
            return res;
        }
    };
    LinkedList.prototype._remove = function (node) {
        var candidate = this._first;
        while (candidate instanceof Node) {
            if (candidate !== node) {
                candidate = candidate.next;
                continue;
            }
            if (candidate.prev && candidate.next) {
                var anchor = candidate.prev;
                anchor.next = candidate.next;
                candidate.next.prev = anchor;
            }
            else if (!candidate.prev && !candidate.next) {
                this._first = undefined;
                this._last = undefined;
            }
            else if (!candidate.next) {
                this._last = this._last.prev;
                this._last.next = undefined;
            }
            else if (!candidate.prev) {
                this._first = this._first.next;
                this._first.prev = undefined;
            }
            this._size -= 1;
            break;
        }
    };
    LinkedList.prototype.iterator = function () {
        var element;
        var node = this._first;
        return {
            next: function () {
                if (!node) {
                    return FIN;
                }
                if (!element) {
                    element = { done: false, value: node.element };
                }
                else {
                    element.value = node.element;
                }
                node = node.next;
                return element;
            }
        };
    };
    LinkedList.prototype.toArray = function () {
        var result = [];
        for (var node = this._first; node instanceof Node; node = node.next) {
            result.push(node.element);
        }
        return result;
    };
    return LinkedList;
}());
export { LinkedList };
