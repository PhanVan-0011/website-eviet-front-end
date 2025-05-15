import React from 'react';

const PageNotFound = () => {
  return (
    <div id="layoutAuthentication" className="bg-primary">
      <div id="layoutAuthentication_content">
        <main>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-7">
                <div className="card shadow-lg border-0 rounded-lg mt-5">
                 
                  <div className="card-body text-center">
                    {/* Thêm hình ảnh */}
                    <img 
                      src="/assets/images/page_not_found.png" 
                      alt="Page Not Found" 
                      style={{ maxWidth: '100%', height: 'auto' }} 
                    />
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PageNotFound;