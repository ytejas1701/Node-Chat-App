const generateMessage = ({text, username, info})=>{
    return {
        text,
        createdAt: new Date().getTime(),
        username,
        info
    }
}

export { generateMessage };