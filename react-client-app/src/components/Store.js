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
            AllListings: [],

        }

    }


    async componentDidMount(){

        // look for metamask
        await this.GetAllListing()
    }


    // pull all listing from contract
    GetAllListing = async () => {
        

        // show pop over
        this.props.ShowPopup()

        // call contract
        let result = await this.props.ConnectedContract.methods.GetAllStoreListing()
        .call({
            from: this.props.WalletAddr 
        })
        
        // hide pop over
        this.props.HidePopup()
        
        // store to state
        this.setState({AllListings: result}) 


    }



    RenderStore = () => {
        if(this.props.UserRole !== "Developer") return

        // the link looks like this
        // ipfs://bafyreihwlk5ab2gbmrxet4oorugopvzowqnf4ulq6ztxqztp74gdlcg6ee/metadata.json

        return(
            this.state.DevSubmissionListing.map((x, i) => {
                return(
                    <Card style={{ width: '100%' }}>
                    <Card.Img variant="top" src={x.URI}/>
                    <Card.Body style={{backgroundColor: '#343a40'}}>
                        <Card.Title>{x.name}</Card.Title>
                        <Card.Text>
                            <hr/>
                            Description: A game about snake eating each other
                            <hr/>
                            Publisher: {x.publisher}
                            <hr/>
                            Price: {x.price} Dev
    
                        </Card.Text>
                        <Button variant="primary">Purchase</Button>
                    </Card.Body>
                </Card>
                )
            } )
        )
    }


    render() {
        return (
            <div id="modulebox">
                <h2>Store Page</h2>
                <hr />
                <div id="griddisplay">
                    {this.state.AllListings === null ? null : this.RenderStore()}
                </div>

            </div>

        )
    }
}
