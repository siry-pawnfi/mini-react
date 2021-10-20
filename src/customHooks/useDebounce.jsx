import { useEffect, useRef, useCallback } from 'react'

//防抖函数
//触发事件后,n秒内只能执行一次,如果ns内又出发了事件,则会重新计算执行时间
function useDebounce(fn, delay, dep = []){
    const { current } = useRef({fn, timer:null})

    useEffect(()=>{
        current.fn = fn
    },[fn])


    return useCallback((...args)=>{
        //之前的定时器存在,说明回调函数还为执行
        //清除掉之前的定时器,开启新的计时器
        if(current.timer){
            clearTimeout(current.timer)
        }

        current.timer = setTimeout((args)=>{
            current.fn(...args)
        },delay)
    },dep)
}


export default useDebounce