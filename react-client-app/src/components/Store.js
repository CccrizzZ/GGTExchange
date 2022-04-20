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
            Contract: props.contract
        }

    }


    // pull listing from server acoording to the account
    GetMarketListing = () => {



    }


    // renders single card
    RenderCards = () => {
        return(
            <Card style={{ width: '100%', display: 'inline-block' }}>
                <Card.Img variant="top" src="http://media.steampowered.com/apps/csgo/blog/images/fb_image.png?v=6" />
                <Card.Body style={{backgroundColor: '#343a40'}}>
                    <Card.Title>Example Game</Card.Title>
                    <Card.Text>
                        <hr/>
                        Description: A game about snake eating each other
                        <hr/>
                        Publisher: {this.state.ConnectedWalletAddr}
                        <hr/>
                        Price: 5 Dev

                    </Card.Text>
                    <Button variant="primary">Purchase</Button>
                </Card.Body>
            </Card>
        )
    }



    render() {
        return (
            <div id="modulebox">
                <h2>Store Page</h2>
                <hr />
                <div id="griddisplay">
                    {this.RenderCards()}
                    {this.RenderCards()}
                    {this.RenderCards()}
                    {this.RenderCards()}

                </div>

            </div>

        )
    }
}
