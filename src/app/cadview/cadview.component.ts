import { Component, OnInit, Input, Inject } from '@angular/core';
import { ActivatedRoute, Params }   from '@angular/router';
import { FirebaseApp } from 'angularfire2';
import {CadModelService} from '../shared/cad-model.service';
import {CadModel} from '../shared/cad-model';
import {UserService} from '../shared/user.service';
import{UserModel} from '../shared/user-model';

// textencoding for Binary files
import * as encoding from 'text-encoding';
import * as $ from 'jquery';

//import * as Processor from './myBundle.js'
//import openJsCad form plane JavaScript
declare var Processor: any;

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
  public isCodeVisible =false;

  public myClass = "col-sm-12 col-md-12 col-lg-8";

  public user : any;
  public model: CadModel;

  private firebase : any;

  public code : string;

  public gProcessor = null;

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
    //$('#test').ready(function (){console.log("Hallo jquery")});
    console.log ("User   " + this.userService.isLoggedIn);
    window.scrollTo(0, 0);
    //start OpenJsCad processor
     this.gProcessor = new Processor(document.getElementById("viewerContext"),
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

        //load case .jscad
        if(strStorageRef.match(/\.jscad$/i) || strStorageRef.match(/\.js$/i))
        {
          this.isStl = false;
          if (this.userService.isLoggedIn){this.isCodeVisible=true}else{this.isCodeVisible=false}
          let modelData = this.modelService.getModelData(model.modelURL);

          modelData.then(data=>
             {
               console.log("Loading jscad...");

               this.myClass = "col-sm-12 col-md-12 col-lg-8"; //make jscad Style
               this.code = data;

               this.gProcessor.setOpenJsCadPath(this.gProcessor.baseurl+'../jscad/jscad/Libraries/');// set for library path
               this.gProcessor.setStatus("Processing <img id=busy src='jscad/jscad/imgs/busy.gif'>");
               this.gProcessor.setJsCad(data);
               this.gProcessor.viewer.handleResize(); //call handleResize otherwise it looks ugly
             });
        }
        //load case .stl
        else
        {
            this.isStl = true;
            this.isCodeVisible=false;
            let modelData = this.modelService.getModelDataBinary(model.modelURL);

            modelData.then(dataBinary=>
             {
               let decoder = new encoding.TextDecoder('x-user-defined');
               let data = decoder.decode(dataBinary)//String.fromCharCode.apply(null, new Uint8Array(dataBinary));

               console.log("Loading other File Format...");

               this.myClass="col-sm-12"; //make stl Style

               this.gProcessor.setStatus("Converting <img id=busy src='jscad/jscad/imgs/busy.gif'>");
               this.gProcessor.setOpenJsCadPath(this.gProcessor.baseurl+'../jscad/jscad/Libraries/');// set for library path
               var worker = Processor.createImportWorker(this.gProcessor);

               var u= this.gProcessor.baseurl+ '../jscad/jscad/Libraries/';
               //var u = 'https://gitcdn.xyz/repo/jw1401/openjscadV3/master/Viewer/Libraries/';

               //note: cache: false is set to allow evaluation of 'include' statements
               worker.postMessage({baseurl: u, source: data, filename: "*.stl", cache: false});
             });
        }
      });
    }

    redrawCadModel()
    {
      this.gProcessor.setJsCad(this.code);
      this.gProcessor.viewer.handleResize(); //call handleResize otherwise it looks ugly
    }
}
