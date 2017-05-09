import { Component, OnInit, Input, Inject } from '@angular/core';
import { ActivatedRoute, Params }   from '@angular/router';
import { FirebaseApp } from 'angularfire2';
import {CadModelService} from '../shared/cad-model.service';
import {CadModel} from '../shared/cad-model';
import {UserService} from '../shared/user.service';
import{UserModel} from '../shared/user-model';

//import openJsCad form plane JavaScript
declare var OpenJsCad: any; //import * as OpenJsCad from '../../openjscad/Viewer/openjscad-lib/openjscad';

@Component
({
  selector: 'app-cadview',
  templateUrl: './cadview.component.html',
  styleUrls: ['./cadview.component.css']
})

export class CadviewComponent implements OnInit
{
  private modelKey : string;

  public isStl = true;
  public myClass = "col-sm-12 col-md-12 col-lg-8";

  public user : any;
  public model: CadModel;

  private firebase : any;

  constructor( private userService: UserService, private modelService:CadModelService, private route: ActivatedRoute, @Inject(FirebaseApp) fb: any)
  {
    //get reference model_uid form passed parameters
    this.route.params.map( params => params['model_uid']).subscribe((id)=>
    {
      this.modelKey = id;
    });
    this.firebase=fb;
  }

  ngOnInit()
  {
    //start OpenJsCad processor
    var gProcessor = new OpenJsCad.Processor(document.getElementById("viewerContext"),
                               {
                                    viewerwidth: '100%',
                                    viewerheight: '100%',
                                    drawLines: false,
                                    drawFaces: true,
                                });

    //get the item from firebase only one time
    this.modelService.getModelByKey(this.modelKey).then(model =>
      {
        this.model = model;
        this.user = this.userService.getUserById(this.model.userId)

        let strStorageRef = this.firebase.storage().refFromURL(model.modelURL).toString();
        let modelData = this.modelService.getModelData(model.modelURL);

        //load case .jscad
        if(strStorageRef.match(/\.jscad$/i) || strStorageRef.match(/\.js$/i))
        {
          modelData.then(data=>
             {
               console.log("Loading jscad...");
               this.isStl = false;
               this.myClass = "col-sm-12 col-md-12 col-lg-8"; //make jscad Style

               gProcessor.setOpenJsCadPath('../openjscad/Viewer/openjscad-lib/');// set for library path
               gProcessor.setStatus("Processing <img id=busy src='openjscad/Viewer/imgs/busy.gif'>");
               gProcessor.setJsCad(data);
               gProcessor.viewer.handleResize(); //call handleResize otherwise it looks ugly
             });
        }
        //load case .stl -- is not workin for Binary Stl !?
        else
        {
            modelData.then(data=>
             {
               console.log("Loading other File Format...");
               this.isStl = true;
               this.myClass="col-sm-12"; //make stl Style

               gProcessor.setStatus("Converting <img id=busy src='openjscad/Viewer/imgs/busy.gif'>");
               gProcessor.setOpenJsCadPath('../openjscad/Viewer/openjscad-lib/');// set for library path
               var worker = OpenJsCad.createConversionWorker(gProcessor);

               //var u= gProcessor.baseurl+ '../openjscad/Viewer/openjscad-lib/';
               var u = 'https://johnny-5eb4e.firebaseapp.com/openjscad/Viewer/openjscad-lib/';

               //note: cache: false is set to allow evaluation of 'include' statements
               worker.postMessage({baseurl: u, source: data, filename: "*.stl", cache: false});
             });
        }
      });
    }
}
