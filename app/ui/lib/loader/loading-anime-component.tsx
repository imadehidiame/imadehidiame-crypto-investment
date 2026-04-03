import styles from './loader-style.module.css'
import clsx from 'clsx'


export default function LoadingAnimeComponent() {
   
    return ( 
    <>
        <div id='loading-bar' className={clsx(styles.load_bar,'hidden')}></div>
        <div id="loading-circle" className={clsx('fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-white bg-opacity-30','hidden')}>
        {/*<div className="w-20 h-20 border-8 border-t-8 border-blue-200 rounded-full animate-spin"></div>*/}
        <div className={styles.loading_circle}></div> 
        </div>
    </>
    )
}