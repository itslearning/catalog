import isEmpty from 'ramda/src/isEmpty';
import is from 'ramda/src/is';

//
// Sequentially runs scripts as they are added
//


let current = null;
let queue = [];
let dequeue = (handler) => {
  current = handler();
  current.then(() => {
    current = null;
    if (queue.length > 0) {
      return dequeue(queue.shift());
    }
    return void 0;
  });
  return current.catch( () => {
    throw new Error('Error loading script');
  });
};
let enqueue = (handler) => {
  if (current !== null) {
    return queue.push(handler);
  }
  return dequeue(handler);
};
let execScript = (decorate, doc = document) => {
  let script = doc.createElement('script');
  script.setAttribute('type', 'text/javascript');
  decorate(script);
  let head = doc.getElementsByTagName('head')[0] || doc.documentElement;
  return head.appendChild(script);
};
let execRemote = (src) => {
  return () => {
    return new Promise( (resolve, reject) => {
      return execScript( (script) => {
        script.addEventListener('load', resolve, false);
        script.addEventListener('error', reject, false);
        return script.setAttribute('src', src);
      });
    });
  };
};
let execInline = (src, doc = document) => {
  return () => {
    return new Promise( (resolve) => {
      return execScript( (script) => {
        script.appendChild(doc.createTextNode(src));
        return resolve();
      }, doc);
    });
  };
};

export default (srcOrEl) => {
  if (is(String, srcOrEl) && !isEmpty(srcOrEl.trim())) {
    enqueue(execRemote(srcOrEl));
  }
  if (srcOrEl.textContent && !isEmpty(srcOrEl.textContent.trim())) {
    return enqueue(execInline(srcOrEl.textContent, srcOrEl.ownerDocument));
  }
  return void 0;
};
