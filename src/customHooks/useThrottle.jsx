import { useEffect, useRef, useCallback } from 'react'

//节流钩子函数
//连续触发事件,但是在n秒钟只执行一次函数(稀释函数执行的频率)
function useThrottle(fn, delay, dep = []){
    const { current } = useRef({fn, timer: null})

    useEffect(()=>{
        current.fn = fn
    },[fn])

    return useCallback((...args)=>{
        if(!current.timer){
            current.timer = setTimeou(()=>{
                // delete current.timer
                Reflect.deleteProperty(current, 'timer')//有返回值 删除成功返回true
            },delay)
            current.fn(...args)
        }
    },dep)
}


export default useThrottle