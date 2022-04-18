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

} from 'react-bootstrap'
import './Box.css'


export default class P2PMarketplace extends Component {
    constructor(props) {
        super(props)

        // wallet address from parent component
        this.state = {
            ConnectedWalletAddr: props.addr,

        }
    }

    
    // post my token listing
    PostListing = () => {

    }


    // purchase token by id
    Purchase = (id) => {

    }


    // renders single card
    RenderCards = () => { 
        return(
            <Card style={{ }}>
                <Card.Img variant="top" src="http://media.steampowered.com/apps/csgo/blog/images/fb_image.png?v=6" />
                <Card.Body style={{backgroundColor: '#343a40'}}>
                    <Card.Title>Example Game</Card.Title>
                    <Card.Text>
                        <hr/>
                        Description: A game about snake eating each other
                        <hr/>
                        Seller: {this.state.ConnectedWalletAddr}
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
                <h2>P2P Market place</h2>
                <hr />
                {this.RenderCards()}
                {this.RenderCards()}
                {this.RenderCards()}
                {this.RenderCards()}

            </div>
        )
    }
}
