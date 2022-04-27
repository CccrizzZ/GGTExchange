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
    Modal,
    Form

} from 'react-bootstrap'
import './Box.css'


export default class P2PMarketplace extends Component {
    constructor(props) {
        super(props)

        // wallet address from parent component
        this.state = {
            show: false,
        }
    }

    
    // post my token listing
    PostListing = (name, price) => {

    }


    // purchase token by id
    Purchase = (gid) => {

    }

    // toggle the model
    TogglePurchaseModel = () => {
        let temp = !this.state.show
        this.setState({ show: temp })
    }

    RenderP2PCard = (img) => {
        return (
            <Card style={{ width: '100%' }}>
                <Card.Img variant="top" src={img}/>
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
                <h2>P2P Market place</h2>
                <hr />
                
                {/* the */}
                <div id="griddisplay">
                    {this.RenderP2PCard("http://media.steampowered.com/apps/csgo/blog/images/fb_image.png?v=6")}
                    {this.RenderP2PCard("http://media.steampowered.com/apps/csgo/blog/images/fb_image.png?v=6")}
                    {this.RenderP2PCard("http://media.steampowered.com/apps/csgo/blog/images/fb_image.png?v=6")}
                    {this.RenderP2PCard("https://cdn.akamai.steamstatic.com/steam/apps/1046930/capsule_616x353.jpg?t=1621357797")}
                    {this.RenderP2PCard("https://cdn.akamai.steamstatic.com/steam/apps/1046930/capsule_616x353.jpg?t=1621357797")}

                </div>

                <Modal show={this.state.show} onHide={this.TogglePurchaseModel} backdrop="static" keyboard={false}>
                    <Modal.Header closeButton>
                        <Modal.Title>Modal title</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <ListGroup>
                            <ListGroup.Item>Price: </ListGroup.Item>
                            <ListGroup.Item>Fees: is price x 0.02</ListGroup.Item>
                            <ListGroup.Item>Total: {1000}</ListGroup.Item>
                        </ListGroup>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.TogglePurchaseModel}>Close</Button>
                        <Button variant="primary">Understood</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}
