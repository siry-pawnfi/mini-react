

//########1.声明阶段

/***********mount时************/ 
//useState的执行方法
function mountState<S>(
    initialState: (()=>S) | S,
) : [S, Dispatch<BasicStateAction<S>>]{
    //创建并返回当前的hook
    const hook = mountWorkInProgressHook()

    //...复制初始化state


    //创建queue
    const queue = (hook.queue = {
        pending: null,
        dispatch: null,
        //这里的basicStateReducer为useReducer的一个方法,下文可见
        lastRenderedReducer: basicStateReducer,
        lastRenderedState: (initialState: any),
    })


    //...创建dispatch
    return [hook.memoizedState, dispatch]
}


function mountreducer<S, I, A>(
    reducer:(S, A) => S,
    initialArg: I,
    init?: I=>S,
):[S,Dispatch<A>]{
    //创建并返回当前的hook
    const hook = mountWorkInProgressHook()


    //...复制初始state

    //创建queue
    const queu = (hook.queue = {
        //保存update对象
        pending: null,

        //保存dispatchAction.bind()的值
        dispatch: null,

        //上一次render时使用的reducer
        lastRenderedReducer: reducer,

        //上一次render时的state
        lastRenderedState: (initialState: any)
    })


    //...创建dispatch
    return [hook.memoizedState, dispatch];
}


function basicStateReducer<S>(state:S, action:BasicStateAction<S>):S{
    //这里对应这 useState的函数式更新和普通的赋值更新
    return typeof action === 'function' ? action(state) : action
}


/***********update时************/ 
//更新时,两者调用的是同一个函数updateReducer

function updateReducer<S, I, A>(
    reducer:(S, A) => S,
    initialAtg:I,
    init?: I => S,
):[S, Dispatch<A>]{
    //获取当前的hooks
    const hook = updateWorkInProgressHook()
    const queue = hook.queue

    queue.lastRenderedReducer = reducer

    //..同update与updateQueue类似的更新逻辑

    const dispatch: Dispatch<A> = (queue.dispatch: any);
    return [hook.memoizedState, dispatch]
}



//########2.调用阶段

function dispatchAction(fiber, queue, action){

    //...创建update
    const update = {
        eventTime: eventTime,
        lane:lane,
        suspenseConfig:suspenseConfig,
        action:action,
        eagerReducer:null,
        eagerState:null,
        next:null,
    }


    //...将update加入到queue.pending

    let alternate = fiber.alternate
    if(
        //currentlyRenderingFiber即workInProgress 
        //workInProgress存在代表当前处于render阶段。
        fiber === currentlyRenderingFiber$1 ||
        alternate !== null &&
        alternate === currentlyRenderingFiber$1
        ){
        //render阶段触发的更新 做一个标记
        didScheduleRenderPhaseUpdateDuringThisPass = 
        disScheduleRenderPhaseUpdate = true
        } else {
            //判断优先级
            if(
                fiber.lanes === NoLanes &&
                (alternate === null || alternate.lanes === NoLanes)
                ){
                    ///...fiber的updateQueue为空,优化路径
                }


                scheduleUpdateOnFiber(fiber, lane, eventTime);
        }
}
//总的流程概括就是,创建update,将其加入到queu.pending中,并开启调度



//传入给useReducer的reducer函数其实是可变的
import { StrictMode, useReducer } from "react";
import ReactDOM from "react-dom";

const currentReducerRef = {
  current: null
};

const addReducer = (state) => state + 1;
const subReducer = (state) => state - 1;
let i = 0;

setInterval(() => {
  currentReducerRef.current = i++ % 2 ? addReducer : subReducer;
}, 1000);

function App() {
  const [state, dispatch] = useReducer(currentReducerRef.current, 0);

  return <button onClick={dispatch}>数字是：{state}</button>;
}

const rootElement = document.getElementById("root");
ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  rootElement
);
