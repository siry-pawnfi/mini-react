import { useEffect, useRef, useCallback } from 'react'


function useInterval(callback, delay = 1000){
    const saveCallbacked = useRef()

    //保存新的回调在每次更新以及第一次挂载的时候
    useEffect(()=>{
        saveCallbacked.current = callback
    })

    //创建Interval
    useEffect(()=>{
        function tick(){
            //执行回调
            saveCallbacked.current()
        }

        if(delay !== null){
            let id = setInterval(tick, delay)

            //清除函数
            return ()=>{
                //清除定时器
                clearInterval(id)
            }
        }
    },[delay])
}
    