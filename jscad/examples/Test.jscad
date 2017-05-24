function main()
{
  var mycube = CSG.cube({radius: 10});
  var mycircle = CAG.circle({radius: 10});

  // we could just do:
  // return [mycube, mycircle];

  // give each element a description and filename:
  return [
    {
      name: "cube",              // optional, will be used as a prefix for the downloaded stl file
      caption: "A small cube",   // will be shown in the dropdown box
      data: mycube,
    },
    {
      name: "circle",            // optional, will be used as a prefix for the downloaded dxf file
      caption: "Circle",
      data: mycircle,
    },
  ];
}
