import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';



function createElement(type, props, ...children){
  return{
    type,
    props:{
      ...props,
      children:children.map(child => 
        typeof child === 'object' ? child : createTextElement(child)
        )
    }
  }
}

function createTextElement(text){
  return{
    type:'TEXT_ELEMENT',
    props:{
      nodeValue:text,
      children:[],
    }
  }
}

////创建dom元素
function createDom(fiber){
  //生成对用的dom
  let dom = 
    fiber.type === 'TEXT_ELEMENT' 
      ? document.createTextNode('')
      : document.createElement(fiber.type)
  
  updateDom(dom, {}, fiber.props)
  // //过滤掉children属性,将属性分配给节点
  // let isProperty = key => key != 'children'
  // Object.keys(fiber.props)
  //   .filter(isProperty)
  //   .forEach(name => {
  //     dom[name] = fiber.props[name]
  //   })
    return dom

    // //递归的对子元素做同样的操作
    // element.props.children.map(child => render(child,dom))
    // //添加到容器
    // container.appendChild(dom)
}


const isEvent = key => key.startsWith('on')
const isProperty = key => key !== 'children' && !isEvent(key)
const isNew = (prev, next)=> key =>
  prev[key] !== next[key]
const isGone = (prev, next)=>key => !(key in next)
function updateDom(dom, prevProps, nextProps){
  //remove old or change event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(key=>
      !(key in nextProps)||
      isNew(prevProps, nextProps)(key)
    )
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.removeEventListener(
        eventType,
        prevProps[name]
      )
    })

    //remove old properties
    Object.keys(prevProps)
      .filter(isProperty)
      .filter(isGone(prevProps, nextProps))
      .forEach(name => {
        dom[name] = ''
      })
    
    //set new or change properties
    Object.keys(nextProps)
      .filter(isProperty)
      .filter(isNew(prevProps, nextProps))
      .forEach(name => {
        dom[name] = nextProps[name]
      })

      //add event listeners
      Object.keys(nextProps)
        .filter(isEvent)
        .filter(isNew(prevProps, nextProps))
        .forEach(name => {
          const eventType = name
            .toLowerCase()
            .substring(2)
          dom.addEventListener(
            eventType,
            nextProps[name]
          )
        })
}
function commitRoot(){
  deletions.forEach(commitWork)
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
}

function commitWork(fiber){
  if(!fiber){
    return
  }
  let domParentFiber = fiber.parent
  while(!domParentFiber.dom){
    domParentFiber = domParentFiber.parent
  }
  const domParent = domParentFiber.dom

  // const domParent = fiber.parent.dom
  if(
    fiber.effectTag === 'PLACEMENT' &&
    fiber.dom != null
  ){
    domParent.appendChild(fiber.dom)
  }else if(fiber.effectTag === 'DELETION'){
    // domParent.removeChild(fiber.dom)
    commitDeletion(fiber, domParent)
  }else if(
    fiber.effectTag === 'UPDATE' &&
    fiber.dom != null
  ){
    updateDom(
      fiber.dom,
      fiber.alternate.props,
      fiber.props,
    )
  }
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function commitDeletion(fiber,domParent){
  if(fiber.dom){
    domParent.removeChild(fiber.child)
  }else{
    commitDeletion(fiber.child, domParent)
  }
}

function render(element, container){
  //设置nextUnitOfWork最为fiber tree的root
  wipRoot = {
    dom:container,
    props:{
      children:[element]
    },
    alternate:currentRoot,
  }
  deletions = []
  nextUnitOfWork = wipRoot
}

let nextUnitOfWork = null
let wipRoot = null
let currentRoot = null
let deletions = null

function workLoop(deadline){
  //deadline 是requestIdleCallback返回的截止时间,反应浏览器再次控制之前还有多少时间
  let shouldYield = false
  while(nextUnitOfWork && !shouldYield){
    //下一个工作单元
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)//正在执行的工作单元,并返回下一个工作单元
    shouldYield = deadline.timeRemaining() < 1
  }

  if(!nextUnitOfWork && wipRoot){
    commitRoot()
  }

  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)
//设置第一个工作单元,并寻找下一个工作单位
function performUnitOfWork(fiber){
  //todo
  // add the element to the DOM
  // create the fibers for the element’s children
  // select the next unit of work
  //每一个fiber节点都有链接到第一个子元素(child)和下一个兄弟节点(slbing),父节点(parent)
  //如果fiber没有child,则执行subing

  // //创建新的节点到dom中
  // if(!fiber.dom){
  //   fiber.dom = createDom(fiber)
  // }

  // // if(fiber.parent){
  // //   fiber.parent.dom.appendChild(fiber.dom)
  // // }


  // //对于每一个child都创建新的fiber
  // const elements = fiber.props.children
  // reconcileChildren(fiber, elements)


  const isFunctionComponent = 
    fiber.type instanceof Function

  if(isFunctionComponent){
    updateFunctionComponent(fiber)
  }else{
    updateHostComponent(fiber)
  }
  
  if(fiber.child){
    return fiber.child
  }
  let nextFiber = fiber
  while(nextFiber){
    if(nextFiber.sibling){
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }

}

let wipFiber = null
let hookIndex = null

function updateFunctionComponent(fiber){
  wipFiber = fiber
  hookIndex = 0
  wipFiber.hooks = []
  const children = [fiber.type(fiber.props)]
  reconcileChildren(fiber, children)
}

function updateHostComponent(fiber){
    // //创建新的节点到dom中
  if(!fiber.dom){
    fiber.dom = createDom(fiber)
  }

  //对于每一个child都创建新的fiber
  const elements = fiber.props.children
  reconcileChildren(fiber, elements)

}

function useState(initial){
  const oldHook = 
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex]
  
  const hook = {
    state:oldHook ? oldHook.state : initial,
    queue:[],
  }

  const actions = oldHook ? oldHook.queue : []
  actions.forEach(action => {
    hook.state = action(hook.state)
  })

  const setState = action => {
    hook.queue.push(action)
    wipRoot = {
      dom:currentRoot.dom,
      props:currentRoot.props,
      alternate:currentRoot,
    }
    nextUnitOfWork = wipRoot
    deletions = []
  }

  wipFiber.hooks.push(hook)
  hookIndex++
  return [hook.state, setState]
}
function reconcileChildren(wipFiber,elements){
  console.log(elements)
  let index = 0
  let oldFiber = 
    wipFiber.alternate && wipFiber.alternate.child
  
  let prevSibling = null

  while(
    index < elements.length ||
    oldFiber != null
  ){
    console.log(index,">>>>>")
    const element = elements[index]
    let newFiber = null

    const sameType =
      oldFiber &&
      element &&
      element.type == oldFiber.type
    
    if(sameType){
      //类型相同
      newFiber = {
        type:oldFiber.type,
        props:element.props,
        dom:oldFiber.dom,
        parent:wipFiber,
        alternate: oldFiber,
        effectTag : "UPDATE",
      }

    }
    if(element && !sameType){
    //类型不同并且有新元素  
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag : "PLACEMENT",
      }
      
    }
    if(oldFiber && !sameType){
      //类型不同
      oldFiber.effectTag = 'DELETION'
      deletions.push(oldFiber)
    }

    if(oldFiber){
      oldFiber = oldFiber.sibling
    }

    if(index === 0){
      wipFiber.child = newFiber
    }else if(element){
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }
}

const Didact = {
  createElement,
  render,
  useState,
};



// /** @jsx Didact.createElement */
// const container = document.getElementById("root");

// const updateValue = e => {
//   rerender(e.target.value)
// }
// const rerender = value => {
//   const element = (
//     <div>
//       <input onInput={updateValue} value={value}/>
//       <h2>Hello {value}</h2>
//     </div>
//   )
//   Didact.render(element, container)
// }
// rerender('World')

/** @jsx Didact.createElement */
function Counter(){
  const [state,setState] = Didact.useState(1)
  return (
    <h1 onClick={()=>setState(c => c + 1)}>
      Count:{state}
    </h1>
  )
}
const element = <Counter/>
const container = document.getElementById("root");
Didact.render(element, container)


// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById('root')
// );

// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
