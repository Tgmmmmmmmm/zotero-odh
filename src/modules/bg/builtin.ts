export class Builtin {
  dicts: any;
  constructor() {
    this.dicts = {};
  }

  async loadData() {
    this.dicts["collins"] = await Builtin.loadData(
      rootURI + "data/collins.json",
    );
  }

  findTerm(dictname: string, term: string) {
    const dict = this.dicts[dictname];
    return dict[term] ? JSON.stringify(dict[term]) : null;
  }

  static async loadData(path: string) {
    // return new Promise((resolve, reject) => {
    //   const request = {
    //     url: path,
    //     type: "GET",
    //     dataType: "json",
    //     timeout: 5000,
    //     error: (xhr, status, error) => reject(error),
    //     success: (data, status) => resolve(data),
    //   };
    //   $.ajax(request);
    // });
    const data = await fetch(path).then((response) => {
      if (response.ok) {
        return response.json();
      }
    });
    return new Promise((resolve, reject) => {
      resolve(data);
    });
  }
}
