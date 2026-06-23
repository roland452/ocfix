import { create } from "zustand";

const useTheme = create(() => ({

    colorTheme:[
       
        {
            name:'dark-blue',
            bg:'#01193f',
            main:'#001223',
            primary:'#3880e4',
            text:'#3385ff',
            color:'#3385ff'
        },

                
        {
            name:'dark-pink',
            bg:'#a30c4e',
            main:'#d01465',
            primary:'#58042e',
            text:'black',
            color:'#df4592'
        },

        {
            name:'light-pink',
            bg:'rgb(56, 3, 82)',
            main:'#1c0232',
            primary:'rgb(190, 75, 171)',
            text:'#bb1ce3',
            color:'#d36bd3'
        },

        {
            name:'light-blue',
            bg:'rgb(73, 138, 236)',
            main:'#6ca3e9',
            primary:'rgb(2, 18, 59)',
            text:'#36393c',
            color:'rgb(13, 50, 161)'
        },

        {
            name:'green',
            bg:'#1c5205',
            main:'#187507',
            primary:'#0fb324',
            text:'black',
            color:'#17d811'
        },

        {
            name:'black',
            bg:'rgb(90, 56, 43)',
            main:'rgb(200, 70, 50)',
            primary:'rgb(166, 67, 67)',
            text:'rgb(255, 255, 255)',
            color:'rgb(238, 94, 17)'
        },
       
    ]
}))


export default useTheme