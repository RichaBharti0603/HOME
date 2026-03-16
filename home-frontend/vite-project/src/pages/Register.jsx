import { useState } from "react"
import "./register.css"

export default function Register(){

const [name,setName]=useState("")
const [email,setEmail]=useState("")
const [password,setPassword]=useState("")

const registerUser = async () => {

const response = await fetch("http://127.0.0.1:8000/auth/register",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
name,
email,
password
})

})

const data = await response.json()

alert(JSON.stringify(data))

}

return(

<div className="container">

<div className="image-grid">

<img src="/images/img1.jpg" className="grid-img"/>
<img src="/images/img2.jpg" className="grid-img"/>
<img src="/images/img3.jpg" className="grid-img"/>
<img src="/images/img4.jpg" className="grid-img"/>
<img src="/images/img5.jpg" className="grid-img"/>
<img src="/images/img6.jpg" className="grid-img"/>

</div>

<div className="form-card">

<h2 className="title">Join HOME</h2>
<p className="subtitle">Start monitoring your websites, portfolios and businesses</p>

<input
placeholder="Name"
value={name}
onChange={(e)=>setName(e.target.value)}
/>

<input
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
/>

<input
type="password"
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
/>

<button onClick={registerUser}>
Register
</button>

</div>

</div>

)

}