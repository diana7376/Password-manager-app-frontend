import React, { createContext, useContext, useReducer } from 'react'


export const AppActionTypes = {
  LOGIN: "login",
  LOGOUT: "logout",
}

const reducerFunction = (state, action) => {
  switch(action.type) {
    case AppActionTypes.LOGIN: {
      localStorage.setItem('token', action.token)
      return { ...state, loggedIn: true }
    }
    case AppActionTypes.LOGOUT: {
      localStorage.removeItem('token')
      return {
        ...state,
        loggedIn: false,
      }
    }
    default: {
      throw new Error()
    }
  }
}

const AppContext = createContext()
const initialState = {
  loggedIn: !!localStorage.getItem('token'),
  selectedGroupId: 0,
}

export const AppContextProvider = ({children}) => {
  const [state, dispatch] = useReducer(reducerFunction, initialState)

  return (
    <AppContext.Provider value={{ ...state, dispatch }}>
      { children }
    </AppContext.Provider>
  )

}

export const useAppContext = () => useContext(AppContext)
