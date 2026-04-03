import toast from "react-hot-toast"
import { createHotelApi, deleteHotelApi, getAllHotelApi, updateHotelApi } from "../../api/client/api"

export const createHotelAction = (hotelData)=>async(dispatch)=>{
    try {
        dispatch({
            type:"hotelCreateRequest",

        })
        const data = await createHotelApi(hotelData)
  
        if(data.success){
            dispatch({
                type:"hotelCreateSuccess",
                payload:data.data
            })
        } 
       else{
        dispatch({
            type:"hotelCreateFailed",
            payload:"Error when create",

        })
       }
        
    } catch (error) {
        dispatch({
            type:"hotelCreateFailed",
            payload:error?.response?.data?.message||"Error in axios",

        })
    }
}


export const getAllHotelsAction = (params) => async(dispatch) => {
    try {
        dispatch({
            type:"getAllHotelRequest",

        })
        const data = await getAllHotelApi(params)

        if(data.success){
            dispatch({
                type:"getAllHotelSuccess", // Sửa lỗi chính tả: Sucess -> Success
                payload: data // <-- THAY ĐỔI: Truyền toàn bộ object data (bao gồm total, totalPages...)
            })
        } 
       else{
        dispatch({
            type:"getAllHotelFailed",
            payload:"Error when create",

        })
       }
        
    } catch (error) {
        dispatch({
            type:"getAllHotelFailed",
            payload:error?.response?.data?.message||"Error in axios",

        })
    }
}


export const deleteHotelAction = (id)=>async(dispatch)=>{
    try {
        dispatch({
            type:"deleteHotelRequest",

        })
        const data = await deleteHotelApi(id)
  
        
        
    } catch (error) {
        dispatch({
            type:"deleteHotelFailed",
            payload:error?.response?.data?.message||"Error in axios",

        })
    }
}

export const updateHotelAction = (hotelData)=>async(dispatch)=>{
        try {
            dispatch({
                type:"updateHotelRequest",
    
            })
            const data = await updateHotelApi(hotelData)
            
            if(data.success){
                dispatch({
                    type:"updateHotelSuccess",
                    payload:data.data
                })
                toast.success('Hotel updated successfully!');
            }
              else{
                dispatch({
                    type:"updateHotelFailed",
                    payload:"Error when update Hotel",
    
                })
                toast.error('Hotel updated failed!');

            }
            
        } catch (error) {
            dispatch({
                type:"updateHotelFailed",
                payload:error?.response?.data?.message||"Error in axios",
    
            })
        }
    
    
    
}