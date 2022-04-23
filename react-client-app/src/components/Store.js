import React, { Component } from 'react'
import { 
    Button, 
    Card, 
    ListGroup, 
    InputGroup, 
    FormControl, 
    Spinner, 
    Navbar,
    Container,
    ButtonGroup

} from 'react-bootstrap'
import './Box.css'
import Web3 from 'web3'

export default class Store extends Component {
    constructor(props) {
        super(props)
        
        // wallet address from parent component
        this.state = {
            ConnectedWalletAddr: props.addr,
            ConnectedContract: props.contract,
            RenderCards: props.RenderCards,
            ShowWaitingPopup: props.ShowPopup,
            HideWaitingPopup: props.HidePopup
        }

    }


    // pull listing from server acoording to the account
    GetMarketListing = () => {
        


    }





    render() {
        return (
            <div id="modulebox">
                <h2>Store Page</h2>
                <hr />
                <div id="griddisplay">
                    {this.state.RenderCards("http://media.steampowered.com/apps/csgo/blog/images/fb_image.png?v=6")}
                    {this.state.RenderCards("https://cdn.akamai.steamstatic.com/steam/apps/570/header.jpg?t=1639608963")}
                    {this.state.RenderCards("https://cdn.akamai.steamstatic.com/steam/apps/1046930/capsule_616x353.jpg?t=1621357797")}
                    {this.state.RenderCards("https://img.republicworld.com/republic-prod/stories/promolarge/xhdpi/yw9cmbd1dibhnkzv_1644326540.jpeg")}

                </div>

            </div>

        )
    }
}
